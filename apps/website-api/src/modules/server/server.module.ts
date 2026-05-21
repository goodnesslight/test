import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServerController } from './server.controller';
import { ServerEntity } from './server.entity';
import { ServerRepository } from './server.repository';
import { ServerService } from './server.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServerEntity])],
  controllers: [ServerController],
  providers: [ServerService, ServerRepository],
})
export class ServerModule {}
