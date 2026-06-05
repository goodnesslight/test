import { TeamEntity } from '@modules/team/team.entity';
import { TeamService } from '@modules/team/team.service';
import { TeamMemberEntity } from '@modules/team/team-member.entity';

import { CreateEventDto, SetAttendanceDto, UpdateEventDto } from '@shared/dtos';
import { TeamMemberRole } from '@shared/types';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EventEntity } from './event.entity';
import { EventRepository } from './event.repository';
import { EventAttendanceEntity } from './event-attendance.entity';
import { EventAttendanceRepository } from './event-attendance.repository';

const MANAGER_ROLES: TeamMemberRole[] = [
  TeamMemberRole.COACH,
  TeamMemberRole.CAPTAIN,
];

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly eventAttendanceRepository: EventAttendanceRepository,
    private readonly teamService: TeamService
  ) {}

  async create(
    teamId: number,
    userId: number,
    dto: CreateEventDto
  ): Promise<EventEntity> {
    const team: TeamEntity = await this.teamService.getById(teamId);

    this.assertCanManage(team, userId);
    this.assertValidRange(dto.startsAt, dto.endsAt);

    const event: EventEntity = await this.eventRepository.save(
      this.eventRepository.create({
        teamId,
        type: dto.type,
        title: dto.title,
        opponent: dto.opponent ?? null,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        description: dto.description ?? null,
      })
    );

    return await this.getByIdWithAttendances(event.id);
  }

  async getForTeam(
    teamId: number,
    userId: number,
    from?: string,
    to?: string
  ): Promise<EventEntity[]> {
    const team: TeamEntity = await this.teamService.getById(teamId);

    this.assertCanView(team, userId);

    return await this.eventRepository.findByTeam(
      teamId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined
    );
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateEventDto
  ): Promise<EventEntity> {
    const event: EventEntity = await this.getById(id);

    this.assertCanManage(event.team, userId);

    const startsAt: string | Date = dto.startsAt ?? event.startsAt;
    const endsAt: string | Date | null =
      dto.endsAt === undefined ? event.endsAt : dto.endsAt;

    this.assertValidRange(startsAt, endsAt ?? undefined);

    await this.eventRepository.update(id, {
      type: dto.type ?? event.type,
      title: dto.title ?? event.title,
      opponent: dto.opponent === undefined ? event.opponent : dto.opponent,
      startsAt: new Date(startsAt),
      endsAt: endsAt ? new Date(endsAt) : null,
      description:
        dto.description === undefined ? event.description : dto.description,
    });

    return await this.getByIdWithAttendances(id);
  }

  async delete(id: number, userId: number): Promise<void> {
    const event: EventEntity = await this.getById(id);

    this.assertCanManage(event.team, userId);
    await this.eventRepository.delete(id);
  }

  async setAttendance(
    id: number,
    userId: number,
    dto: SetAttendanceDto
  ): Promise<EventEntity> {
    const event: EventEntity = await this.getById(id);
    const isMember: boolean = event.team.members.some(
      (member: TeamMemberEntity): boolean => member.userId === userId
    );

    if (!isMember) {
      throw new ForbiddenException('Only roster members can mark attendance');
    }

    const existing: EventAttendanceEntity | null =
      await this.eventAttendanceRepository.findByEventAndUser(id, userId);

    if (existing) {
      await this.eventAttendanceRepository.update(existing.id, {
        status: dto.status,
      });
    } else {
      await this.eventAttendanceRepository.save(
        this.eventAttendanceRepository.create({
          eventId: id,
          userId,
          status: dto.status,
        })
      );
    }

    return await this.getByIdWithAttendances(id);
  }

  private async getById(id: number): Promise<EventEntity> {
    const event: EventEntity | null =
      await this.eventRepository.findByIdWithRelations(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  private async getByIdWithAttendances(id: number): Promise<EventEntity> {
    const event: EventEntity | null = await this.eventRepository.findOne({
      where: { id },
      relations: { attendances: { user: true } },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  private assertCanView(team: TeamEntity, userId: number): void {
    const isMember: boolean = team.members.some(
      (member: TeamMemberEntity): boolean => member.userId === userId
    );

    if (!isMember && team.organization.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the roster and the organization owner can view the schedule'
      );
    }
  }

  private assertCanManage(team: TeamEntity, userId: number): void {
    if (team.organization.ownerId === userId) {
      return;
    }

    const isManager: boolean = team.members.some(
      (member: TeamMemberEntity): boolean =>
        member.userId === userId && MANAGER_ROLES.includes(member.role)
    );

    if (!isManager) {
      throw new ForbiddenException(
        'Only the owner, coach or captain can manage events'
      );
    }
  }

  private assertValidRange(
    startsAt: string | Date,
    endsAt?: string | Date
  ): void {
    if (endsAt && new Date(endsAt) <= new Date(startsAt)) {
      throw new BadRequestException('endsAt must be later than startsAt');
    }
  }
}
