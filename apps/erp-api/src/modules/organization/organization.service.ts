import { UserEntity } from '@modules/user/user.entity';
import { UserRepository } from '@modules/user/user.repository';
import { DataSource, EntityManager } from 'typeorm';

import {
  OrganizationAddAdminDto,
  OrganizationCreateDto,
  OrganizationUpdateDto,
} from '@shared/dtos';
import { OrganizationRole } from '@shared/types';

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { OrganizationEntity } from './organization.entity';
import { OrganizationRepository } from './organization.repository';
import { OrganizationMemberEntity } from './organization-member/organization-member.entity';
import { OrganizationMemberRepository } from './organization-member/organization-member.repository';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationMemberRepository: OrganizationMemberRepository,
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource
  ) {}

  async create(
    user: UserEntity,
    dto: OrganizationCreateDto
  ): Promise<OrganizationEntity> {
    const organization: OrganizationEntity = await this.dataSource.transaction(
      async (manager: EntityManager): Promise<OrganizationEntity> => {
        const created: OrganizationEntity = await manager.save(
          manager.create(OrganizationEntity, {
            name: dto.name,
            tag: dto.tag,
            slug: dto.slug,
            logoUrl: dto.logoUrl ?? null,
            ownerId: user.id,
          })
        );
        await manager.save(
          manager.create(OrganizationMemberEntity, {
            organizationId: created.id,
            userId: user.id,
            role: OrganizationRole.OWNER,
          })
        );

        return created;
      }
    );

    return await this.getById(organization.id);
  }

  async update(
    id: number,
    user: UserEntity,
    dto: OrganizationUpdateDto
  ): Promise<OrganizationEntity> {
    const organization: OrganizationEntity = await this.getOwnedById(id, user);

    await this.organizationRepository.update(id, {
      name: dto.name ?? organization.name,
      tag: dto.tag ?? organization.tag,
      slug: dto.slug ?? organization.slug,
      logoUrl: dto.logoUrl === undefined ? organization.logoUrl : dto.logoUrl,
    });

    return await this.getById(id);
  }

  async addAdmin(
    id: number,
    user: UserEntity,
    dto: OrganizationAddAdminDto
  ): Promise<OrganizationEntity> {
    const organization: OrganizationEntity = await this.getOwnedById(id, user);

    const target: UserEntity | null =
      (await this.userRepository.findByUsername(dto.identifier)) ??
      (await this.userRepository.findByEmail(dto.identifier));

    if (!target) {
      throw new NotFoundException('User not found');
    }

    if (target.id === organization.ownerId) {
      throw new ConflictException('User is the organization owner');
    }

    const existing: OrganizationMemberEntity | null =
      await this.organizationMemberRepository.findByOrganizationAndUser(
        id,
        target.id
      );

    if (existing) {
      throw new ConflictException('User is already an administrator');
    }

    await this.organizationMemberRepository.save(
      this.organizationMemberRepository.create({
        organizationId: id,
        userId: target.id,
        role: OrganizationRole.ADMIN,
      })
    );

    return await this.getById(id);
  }

  async addMember(
    organizationId: number,
    userId: number,
    role: OrganizationRole
  ): Promise<OrganizationMemberEntity> {
    const existing: OrganizationMemberEntity | null =
      await this.organizationMemberRepository.findByOrganizationAndUser(
        organizationId,
        userId
      );

    if (existing) {
      return existing;
    }

    return await this.organizationMemberRepository.save(
      this.organizationMemberRepository.create({
        organizationId,
        userId,
        role,
      })
    );
  }

  async isManager(organizationId: number, userId: number): Promise<boolean> {
    const member: OrganizationMemberEntity | null =
      await this.organizationMemberRepository.findByOrganizationAndUser(
        organizationId,
        userId
      );

    return (
      member !== null &&
      (member.role === OrganizationRole.OWNER ||
        member.role === OrganizationRole.ADMIN)
    );
  }

  async isMember(organizationId: number, userId: number): Promise<boolean> {
    const member: OrganizationMemberEntity | null =
      await this.organizationMemberRepository.findByOrganizationAndUser(
        organizationId,
        userId
      );

    return member !== null;
  }

  async assertCanManage(
    organizationId: number,
    user: UserEntity
  ): Promise<void> {
    if (!(await this.isManager(organizationId, user.id))) {
      throw new ForbiddenException(
        'Only the organization owner or an admin can do this'
      );
    }
  }

  async getById(id: number): Promise<OrganizationEntity> {
    const organization: OrganizationEntity | null =
      await this.organizationRepository.findByIdWithGames(id);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async getBySlug(slug: string): Promise<OrganizationEntity> {
    const organization: OrganizationEntity | null =
      await this.organizationRepository.findBySlugWithGames(slug);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async getPublicBySlug(slug: string): Promise<OrganizationEntity> {
    if (!slug) {
      throw new NotFoundException('Organization not found');
    }

    const organization: OrganizationEntity | null =
      await this.organizationRepository.findBySlug(slug);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async getCurrent(
    user: UserEntity,
    slug: string
  ): Promise<OrganizationEntity> {
    if (!slug) {
      throw new NotFoundException('Organization not found');
    }

    const organization: OrganizationEntity = await this.getBySlug(slug);

    if (!(await this.isMember(organization.id, user.id))) {
      throw new ForbiddenException(
        'You do not have access to this organization'
      );
    }

    return organization;
  }

  async getOwnedById(
    id: number,
    user: UserEntity
  ): Promise<OrganizationEntity> {
    const organization: OrganizationEntity = await this.getById(id);

    if (organization.ownerId !== user.id) {
      throw new ForbiddenException('Only the organization owner can do this');
    }

    return organization;
  }

  async getMy(user: UserEntity): Promise<OrganizationEntity[]> {
    return await this.organizationRepository.findAllByUser(user.id);
  }

  async delete(id: number, user: UserEntity): Promise<null> {
    await this.getOwnedById(id, user);
    await this.organizationRepository.delete(id);

    return null;
  }

  async removeAdmin(
    id: number,
    memberId: number,
    user: UserEntity
  ): Promise<OrganizationEntity> {
    await this.getOwnedById(id, user);

    const member: OrganizationMemberEntity | null =
      await this.organizationMemberRepository.findOne({
        where: { id: memberId, organizationId: id },
      });

    if (!member || member.role !== OrganizationRole.ADMIN) {
      throw new NotFoundException('Administrator not found');
    }

    await this.organizationMemberRepository.delete(member.id);

    return await this.getById(id);
  }
}
