import { AdminModule } from '@modules/admin/admin.module';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RequestController } from './request.controller';
import { RequestEntity } from './request.entity';
import { RequestRepository } from './request.repository';
import { RequestService } from './request.service';
import { RequestNoteEntity } from './request-note/request-note.entity';
import { RequestNoteRepository } from './request-note/request-note.repository';

@Module({
  imports: [
    AdminModule,
    TypeOrmModule.forFeature([RequestEntity, RequestNoteEntity]),
  ],
  controllers: [RequestController],
  providers: [RequestService, RequestRepository, RequestNoteRepository],
  exports: [RequestService],
})
export class RequestModule {}
