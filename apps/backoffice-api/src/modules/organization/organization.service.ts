import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { OrganizationCreateDto } from '@backoffice/dtos';

import { OrganizationEntity } from './organization.entity';
import { OrganizationRepository } from './organization.repository';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository
  ) {}

  async create(dto: OrganizationCreateDto): Promise<OrganizationEntity> {
    const existing: OrganizationEntity | null =
      await this.organizationRepository.findBySlug(dto.slug);

    if (existing) {
      throw new ConflictException(
        'An organization with this slug already exists'
      );
    }

    return await this.organizationRepository.save(
      this.organizationRepository.create({
        name: dto.name,
        tag: dto.tag,
        slug: dto.slug,
        logoUrl: dto.logoUrl ?? null,
      })
    );
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
}
