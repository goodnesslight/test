import { AdminEntity } from '@modules/admin/admin.entity';

import {
  RequestCreateDto,
  RequestNoteCreateDto,
  RequestUpdateDto,
} from '@backoffice/dtos';
import { RequestStatus } from '@backoffice/types';

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { RequestEntity } from './request.entity';
import { RequestRepository } from './request.repository';
import { RequestNoteEntity } from './request-note/request-note.entity';
import { RequestNoteRepository } from './request-note/request-note.repository';

@Injectable()
export class RequestService {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly requestNoteRepository: RequestNoteRepository
  ) {}

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
    await this.getById(id);
    await this.requestRepository.update(id, { status: dto.status });

    return await this.getById(id);
  }

  async takeIntoWork(id: number, admin: AdminEntity): Promise<RequestEntity> {
    const request: RequestEntity = await this.getById(id);

    if (
      request.status !== RequestStatus.PENDING &&
      request.status !== RequestStatus.IN_PROGRESS
    ) {
      throw new ForbiddenException(
        'Only pending or in-progress requests can be taken into work'
      );
    }

    await this.requestRepository.update(id, {
      assigneeId: admin.id,
      status: RequestStatus.IN_PROGRESS,
    });

    return await this.getById(id);
  }

  async release(id: number, admin: AdminEntity): Promise<RequestEntity> {
    const request: RequestEntity = await this.getById(id);

    this.assertAssignee(request, admin);

    await this.requestRepository.update(id, {
      assigneeId: null,
      status: RequestStatus.PENDING,
    });

    return await this.getById(id);
  }

  async createNote(
    id: number,
    admin: AdminEntity,
    dto: RequestNoteCreateDto
  ): Promise<RequestNoteEntity> {
    const request: RequestEntity = await this.getById(id);

    this.assertAssignee(request, admin);

    return await this.requestNoteRepository.save(
      this.requestNoteRepository.create({
        requestId: request.id,
        adminId: admin.id,
        text: dto.text,
      })
    );
  }

  async getIncoming(): Promise<RequestEntity[]> {
    return await this.requestRepository.findAll();
  }

  async getMine(admin: AdminEntity): Promise<RequestEntity[]> {
    return await this.requestRepository.findByAssignee(admin.id);
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

  async getNotes(
    id: number,
    admin: AdminEntity
  ): Promise<RequestNoteEntity[]> {
    await this.getById(id);

    return await this.requestNoteRepository.findByRequestAndAdmin(
      id,
      admin.id
    );
  }

  async delete(id: number): Promise<null> {
    await this.getById(id);
    await this.requestRepository.delete(id);

    return null;
  }

  private assertAssignee(request: RequestEntity, admin: AdminEntity): void {
    if (request.assigneeId !== admin.id) {
      throw new ForbiddenException('This request is not assigned to you');
    }
  }
}
