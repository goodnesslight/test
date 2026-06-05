import { UserEntity } from '@modules/user/user.entity';

import { CreateOrganizationDto, UpdateOrganizationDto } from '@shared/dtos';

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
    owner: UserEntity,
    dto: CreateOrganizationDto
  ): Promise<OrganizationEntity> {
    const organization: OrganizationEntity =
      await this.organizationRepository.save(
        this.organizationRepository.create({
          name: dto.name,
          tag: dto.tag,
          logoUrl: dto.logoUrl ?? null,
          ownerId: owner.id,
        })
      );

    return await this.getById(organization.id);
  }

  async getById(id: number): Promise<OrganizationEntity> {
    const organization: OrganizationEntity | null =
      await this.organizationRepository.findByIdWithTeams(id);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async getOwnedById(id: number, userId: number): Promise<OrganizationEntity> {
    const organization: OrganizationEntity = await this.getById(id);

    if (organization.ownerId !== userId) {
      throw new ForbiddenException('Only the organization owner can do this');
    }

    return organization;
  }

  async getMyOrganizations(userId: number): Promise<OrganizationEntity[]> {
    return await this.organizationRepository.findAllByUser(userId);
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateOrganizationDto
  ): Promise<OrganizationEntity> {
    const organization: OrganizationEntity = await this.getOwnedById(
      id,
      userId
    );

    await this.organizationRepository.update(id, {
      name: dto.name ?? organization.name,
      tag: dto.tag ?? organization.tag,
      logoUrl: dto.logoUrl === undefined ? organization.logoUrl : dto.logoUrl,
    });

    return await this.getById(id);
  }

  async delete(id: number, userId: number): Promise<void> {
    await this.getOwnedById(id, userId);
    await this.organizationRepository.delete(id);
  }
}
