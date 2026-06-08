import { EventAttendanceEntity } from '@modules/event/event-attendance/event-attendance.entity';
import { EventAttendanceRepository } from '@modules/event/event-attendance/event-attendance.repository';
import { TeamMemberEntity } from '@modules/team/team-member/team-member.entity';
import { TeamMemberRepository } from '@modules/team/team-member/team-member.repository';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      TeamMemberEntity,
      EventAttendanceEntity,
    ]),
  ],
  controllers: [UserController],
  providers: [
    EventAttendanceRepository,
    TeamMemberRepository,
    UserRepository,
    UserService,
  ],
  exports: [UserRepository, UserService],
})
export class UserModule {}
