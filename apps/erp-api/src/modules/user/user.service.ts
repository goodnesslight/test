import { EventAttendanceEntity } from '@modules/event/event-attendance/event-attendance.entity';
import { EventAttendanceRepository } from '@modules/event/event-attendance/event-attendance.repository';
import { TeamEntity } from '@modules/team/team.entity';
import { TeamMemberEntity } from '@modules/team/team-member/team-member.entity';
import { TeamMemberRepository } from '@modules/team/team-member/team-member.repository';
import { randomUUID } from 'crypto';

import { UserUpdateProfileDto } from '@shared/dtos';
import { EventAttendanceStatus, TeamMemberRole } from '@shared/types';

import { Injectable, NotFoundException } from '@nestjs/common';

import { UserEntity } from './user.entity';
import { UserRepository } from './user.repository';

export interface UserProfileResult {
  id: number;
  username: string;
  createdAt: Date;
  teams: UserProfileTeamResult[];
  attendance: UserProfileAttendanceResult;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

export interface UserProfileTeamResult {
  teamId: number;
  role: TeamMemberRole;
  team: TeamEntity;
}

export interface UserProfileAttendanceResult {
  total: number;
  going: number;
  maybe: number;
  declined: number;
  rate: number;
}

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly teamMemberRepository: TeamMemberRepository,
    private readonly eventAttendanceRepository: EventAttendanceRepository
  ) {}

  async updateProfile(
    user: UserEntity,
    dto: UserUpdateProfileDto
  ): Promise<UserEntity> {
    await this.userRepository.update(user.id, {
      firstName:
        dto.firstName === undefined
          ? user.firstName
          : dto.firstName.trim() || null,
      lastName:
        dto.lastName === undefined
          ? user.lastName
          : dto.lastName.trim() || null,
      locale: dto.locale ?? user.locale,
    });

    return (await this.userRepository.findById(user.id)) as UserEntity;
  }

  async regenerateCalendarToken(user: UserEntity): Promise<UserEntity> {
    await this.userRepository.update(user.id, {
      calendarToken: randomUUID(),
    });

    return (await this.userRepository.findById(user.id)) as UserEntity;
  }

  async getProfileById(id: number): Promise<UserProfileResult> {
    const user: UserEntity | null = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const memberships: TeamMemberEntity[] =
      await this.teamMemberRepository.findByUser(id);
    const attendances: EventAttendanceEntity[] =
      await this.eventAttendanceRepository.findByUser(id);

    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      teams: memberships.map(
        (member: TeamMemberEntity): UserProfileTeamResult => ({
          teamId: member.teamId,
          role: member.role,
          team: member.team,
        })
      ),
      attendance: this.buildAttendanceStats(attendances),
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
    };
  }

  private buildAttendanceStats(
    attendances: EventAttendanceEntity[]
  ): UserProfileAttendanceResult {
    const total: number = attendances.length;
    const going: number = attendances.filter(
      (attendance: EventAttendanceEntity): boolean =>
        attendance.status === EventAttendanceStatus.GOING
    ).length;
    const maybe: number = attendances.filter(
      (attendance: EventAttendanceEntity): boolean =>
        attendance.status === EventAttendanceStatus.MAYBE
    ).length;
    const declined: number = attendances.filter(
      (attendance: EventAttendanceEntity): boolean =>
        attendance.status === EventAttendanceStatus.DECLINED
    ).length;

    return {
      total,
      going,
      maybe,
      declined,
      rate: total === 0 ? 0 : Math.round((going / total) * 100),
    };
  }
}
