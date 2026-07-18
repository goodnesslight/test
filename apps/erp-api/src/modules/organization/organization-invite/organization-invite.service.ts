import { randomBytes } from 'node:crypto';

import { ConfigKey } from '@common/types/config.type';
import { MailService } from '@modules/mail/mail.service';
import { UserEntity } from '@modules/user/user.entity';
import { UserRepository } from '@modules/user/user.repository';
import { DataSource, EntityManager } from 'typeorm';

import { OrganizationInviteCreateDto } from '@erp/dtos';
import { InviteStatus, OrganizationRole } from '@erp/types';

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { OrganizationEntity } from '../organization.entity';
import { OrganizationService } from '../organization.service';
import { OrganizationMemberEntity } from '../organization-member/organization-member.entity';

import { OrganizationInviteEntity } from './organization-invite.entity';
import { OrganizationInviteRepository } from './organization-invite.repository';

@Injectable()
export class OrganizationInviteService {
  private readonly INVITE_TTL_MS: number = 7 * 24 * 60 * 60 * 1000;

  constructor(
    private readonly organizationService: OrganizationService,
    private readonly mailService: MailService,
    private readonly organizationInviteRepository: OrganizationInviteRepository,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource
  ) {}

  async create(
    organizationId: number,
    user: UserEntity,
    dto: OrganizationInviteCreateDto
  ): Promise<OrganizationInviteEntity> {
    await this.organizationService.assertCanManage(organizationId, user);

    if (dto.role === OrganizationRole.OWNER) {
      throw new ForbiddenException('Cannot invite a user as the owner');
    }

    const existingUser: UserEntity | null =
      await this.userRepository.findByEmail(dto.email);

    if (
      existingUser &&
      (await this.organizationService.isMember(organizationId, existingUser.id))
    ) {
      throw new ConflictException(
        'This user is already a member of the organization'
      );
    }

    const pendingInvite: OrganizationInviteEntity | null =
      await this.organizationInviteRepository.findPendingByOrganizationAndEmail(
        organizationId,
        dto.email
      );

    if (pendingInvite) {
      throw new ConflictException(
        'An invite is already pending for this email'
      );
    }

    const invite: OrganizationInviteEntity =
      await this.organizationInviteRepository.save(
        this.organizationInviteRepository.create({
          organizationId,
          email: dto.email,
          token: randomBytes(32).toString('hex'),
          role: dto.role,
          status: InviteStatus.PENDING,
          expiresAt: new Date(Date.now() + this.INVITE_TTL_MS),
          firstName: dto.firstName,
          lastName: dto.lastName,
          country: dto.country ?? null,
          birthDate: dto.birthDate ?? null,
          avatarUrl: dto.avatarUrl ?? null,
          invitedUserId: existingUser?.id ?? null,
        })
      );

    const organization: OrganizationEntity =
      await this.organizationService.getById(organizationId);

    await this.mailService.sendOrganizationInvite(
      invite.email,
      organization.name,
      this.buildInviteUrl(organization.slug, invite.token)
    );

    return invite;
  }

  async accept(
    token: string,
    user: UserEntity
  ): Promise<OrganizationInviteEntity> {
    const invite: OrganizationInviteEntity = await this.getPendingByToken(
      token
    );

    if (user.email && user.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw new ForbiddenException(
        'This invitation was issued for a different email address'
      );
    }

    await this.consume(invite, user);

    return invite;
  }

  async consume(
    invite: OrganizationInviteEntity,
    user: UserEntity
  ): Promise<void> {
    await this.dataSource.transaction(
      async (manager: EntityManager): Promise<void> => {
        const existing: OrganizationMemberEntity | null = await manager.findOne(
          OrganizationMemberEntity,
          { where: { organizationId: invite.organizationId, userId: user.id } }
        );

        if (!existing) {
          await manager.save(
            manager.create(OrganizationMemberEntity, {
              organizationId: invite.organizationId,
              userId: user.id,
              role: invite.role,
            })
          );
        }

        // An owner invite (e.g. issued by the backoffice when creating a new
        // organization) also establishes ownership: the organization is created
        // without an ownerId, so set it here when the owner accepts. Guard on
        // null so a stray owner invite can never hijack an already-owned org.
        if (invite.role === OrganizationRole.OWNER) {
          const organization: OrganizationEntity | null = await manager.findOne(
            OrganizationEntity,
            { where: { id: invite.organizationId } }
          );

          if (organization && organization.ownerId === null) {
            await manager.update(OrganizationEntity, invite.organizationId, {
              ownerId: user.id,
            });
          }
        }

        await manager.update(OrganizationInviteEntity, invite.id, {
          status: InviteStatus.ACCEPTED,
          invitedUserId: user.id,
        });
      }
    );
  }

  async getByToken(token: string): Promise<OrganizationInviteEntity> {
    return await this.getPendingByToken(token);
  }

  async findPendingByEmail(
    email: string
  ): Promise<OrganizationInviteEntity | null> {
    const invite: OrganizationInviteEntity | null =
      await this.organizationInviteRepository.findPendingByEmail(email);

    if (!invite || invite.expiresAt.getTime() < Date.now()) {
      return null;
    }

    return invite;
  }

  async getForOrganization(
    organizationId: number,
    user: UserEntity
  ): Promise<OrganizationInviteEntity[]> {
    await this.organizationService.assertCanManage(organizationId, user);

    return await this.organizationInviteRepository.findPendingByOrganization(
      organizationId
    );
  }

  async revoke(
    organizationId: number,
    inviteId: number,
    user: UserEntity
  ): Promise<null> {
    await this.organizationService.assertCanManage(organizationId, user);

    const invite: OrganizationInviteEntity | null =
      await this.organizationInviteRepository.findOne({
        where: { id: inviteId, organizationId },
      });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    await this.organizationInviteRepository.delete(invite.id);

    return null;
  }

  private async getPendingByToken(
    token: string
  ): Promise<OrganizationInviteEntity> {
    const invite: OrganizationInviteEntity | null =
      await this.organizationInviteRepository.findPendingByToken(token);

    if (!invite || invite.expiresAt.getTime() < Date.now()) {
      throw new NotFoundException('Invite not found or has expired');
    }

    return invite;
  }

  private buildInviteUrl(slug: string, token: string): string {
    const url: URL = new URL(
      this.configService.getOrThrow(ConfigKey.CLIENT_URL)
    );
    url.host = `${slug}.${url.host}`;
    url.pathname = `/invite/${token}`;

    return url.toString();
  }
}
