import { UserEntity } from '@modules/user/user.entity';

import { OrganizationCreateDto, OrganizationUpdateDto } from '@shared/dtos';

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { OrganizationEntity } from './organization.entity';
import { OrganizationRepository } from './organization.repository';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository
  ) {}

  async create(
    user: UserEntity,
    dto: OrganizationCreateDto
  ): Promise<OrganizationEntity> {
    const organization: OrganizationEntity =
      await this.organizationRepository.save(
        this.organizationRepository.create({
          name: dto.name,
          tag: dto.tag,
          logoUrl: dto.logoUrl ?? null,
          ownerId: user.id,
        })
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
      logoUrl: dto.logoUrl === undefined ? organization.logoUrl : dto.logoUrl,
    });

    return await this.getById(id);
  }

  async getById(id: number): Promise<OrganizationEntity> {
    const organization: OrganizationEntity | null =
      await this.organizationRepository.findByIdWithTeams(id);

    if (!organization) {
      throw new NotFoundException('Organization not found');
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

  async getMyOrganizations(user: UserEntity): Promise<OrganizationEntity[]> {
    return await this.organizationRepository.findAllByUser(user.id);
  }

  async delete(id: number, user: UserEntity): Promise<null> {
    await this.getOwnedById(id, user);
    await this.organizationRepository.delete(id);

    return null;
  }
}
