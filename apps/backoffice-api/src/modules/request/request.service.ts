import { Injectable, NotFoundException } from '@nestjs/common';

import { RequestCreateDto, RequestUpdateDto } from '@backoffice/dtos';

import { RequestEntity } from './request.entity';
import { RequestRepository } from './request.repository';

@Injectable()
export class RequestService {
  constructor(private readonly requestRepository: RequestRepository) {}

  async create(dto: RequestCreateDto): Promise<RequestEntity> {
    return await this.requestRepository.save(
      this.requestRepository.create({
        name: dto.name,
        email: dto.email,
        organizationName: dto.organizationName,
        message: dto.message ?? null,
      })
    );
  }

  async update(id: number, dto: RequestUpdateDto): Promise<RequestEntity> {
    const request: RequestEntity = await this.getById(id);

    request.status = dto.status;

    return await this.requestRepository.save(request);
  }

  async getAll(): Promise<RequestEntity[]> {
    return await this.requestRepository.findAll();
  }

  async getById(id: number): Promise<RequestEntity> {
    const request: RequestEntity | null = await this.requestRepository.findById(
      id
    );

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  async delete(id: number): Promise<null> {
    await this.getById(id);
    await this.requestRepository.delete(id);

    return null;
  }
}
