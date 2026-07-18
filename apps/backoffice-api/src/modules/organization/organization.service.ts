import { randomBytes } from 'node:crypto';

import { ConfigKey } from '@common/types/config.type';
import { MailService } from '@modules/mail/mail.service';
import { DataSource, EntityManager } from 'typeorm';

import { OrganizationCreateDto } from '@backoffice/dtos';
import { InviteStatus, OrganizationRole } from '@backoffice/types';

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { OrganizationEntity } from './organization.entity';
import { OrganizationRepository } from './organization.repository';
import { OrganizationInviteEntity } from './organization-invite/organization-invite.entity';
import { OrganizationInviteRepository } from './organization-invite/organization-invite.repository';

@Injectable()
export class OrganizationService {
  private readonly INVITE_TTL_MS: number = 7 * 24 * 60 * 60 * 1000;

  constructor(
    private readonly mailService: MailService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationInviteRepository: OrganizationInviteRepository,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource
  ) {}

  async create(dto: OrganizationCreateDto): Promise<OrganizationEntity> {
    const existing: OrganizationEntity | null =
      await this.organizationRepository.findBySlug(dto.slug);

    if (existing) {
      throw new ConflictException(
        'An organization with this slug already exists'
      );
    }

    const invite: OrganizationInviteEntity =
      this.organizationInviteRepository.create({
        email: dto.ownerEmail,
        username: dto.ownerUsername,
        token: randomBytes(32).toString('hex'),
        status: InviteStatus.PENDING,
        role: OrganizationRole.OWNER,
        expiresAt: new Date(Date.now() + this.INVITE_TTL_MS),
        firstName: dto.ownerFirstName ?? null,
        lastName: dto.ownerLastName ?? null,
      });

    const organization: OrganizationEntity = await this.dataSource.transaction(
      async (manager: EntityManager): Promise<OrganizationEntity> => {
        const saved: OrganizationEntity = await manager.save(
          manager.create(OrganizationEntity, {
            name: dto.name,
            tag: dto.tag,
            slug: dto.slug,
            logoUrl: dto.logoUrl ?? null,
          })
        );

        invite.organizationId = saved.id;
        await manager.save(invite);

        return saved;
      }
    );

    await this.mailService.sendOwnerInvite(
      invite.email,
      organization.name,
      this.buildInviteUrl(organization.slug, invite.token)
    );

    return organization;
  }

  async getAll(): Promise<OrganizationEntity[]> {
    return await this.organizationRepository.findAll();
  }

  async getById(id: number): Promise<OrganizationEntity> {
    const organization: OrganizationEntity | null =
      await this.organizationRepository.findById(id);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async delete(id: number): Promise<null> {
    await this.getById(id);
    await this.organizationRepository.delete(id);

    return null;
  }

  private buildInviteUrl(slug: string, token: string): string {
    const url: URL = new URL(
      this.configService.getOrThrow(ConfigKey.PLATFORM_CLIENT_URL)
    );
    url.host = `${slug}.${url.host}`;
    url.pathname = `/invite/${token}`;

    return url.toString();
  }
}
