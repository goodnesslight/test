import { TeamEntity } from '@modules/team/team.entity';
import { TeamService } from '@modules/team/team.service';
import { TeamMemberEntity } from '@modules/team/team-member/team-member.entity';
import { UserEntity } from '@modules/user/user.entity';
import { UserRepository } from '@modules/user/user.repository';
import { randomUUID } from 'crypto';

import {
  EventCreateDto,
  EventCreateRepeatDto,
  EventDeleteDto,
  EventGetFeedDto,
  EventGetListDto,
  EventSetAttendanceDto,
  EventUpdateDto,
} from '@shared/dtos';
import { EventScope, TeamMemberRole } from '@shared/types';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EventEntity } from './event.entity';
import { EventRepository } from './event.repository';
import { EventAttendanceEntity } from './event-attendance/event-attendance.entity';
import { EventAttendanceRepository } from './event-attendance/event-attendance.repository';

@Injectable()
export class EventService {
  private readonly MANAGER_ROLES: TeamMemberRole[] = [
    TeamMemberRole.COACH,
    TeamMemberRole.CAPTAIN,
  ];
  private readonly CALENDAR_NAME: string = 'Platform';
  private readonly CALENDAR_UID_DOMAIN: string = 'platform';
  private readonly DAY_MS: number = 24 * 60 * 60 * 1000;
  private readonly DEFAULT_EVENT_DURATION_MS: number = 60 * 60 * 1000;
  private readonly MAX_SERIES_OCCURRENCES: number = 60;

  constructor(
    private readonly teamService: TeamService,
    private readonly eventRepository: EventRepository,
    private readonly eventAttendanceRepository: EventAttendanceRepository,
    private readonly userRepository: UserRepository
  ) {}

  async create(
    teamId: number,
    user: UserEntity,
    dto: EventCreateDto
  ): Promise<EventEntity> {
    const team: TeamEntity = await this.teamService.getById(teamId);

    this.assertCanManage(team, user);
    this.assertValidRange(dto.startsAt, dto.endsAt);

    if (dto.repeat) {
      return await this.createSeries(teamId, dto, dto.repeat);
    }

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

  async update(
    id: number,
    user: UserEntity,
    dto: EventUpdateDto
  ): Promise<EventEntity> {
    const event: EventEntity = await this.getById(id);

    this.assertCanManage(event.team, user);

    const startsAt: string | Date = dto.startsAt ?? event.startsAt;
    const endsAt: string | Date | null =
      dto.endsAt === undefined ? event.endsAt : dto.endsAt;

    this.assertValidRange(startsAt, endsAt ?? undefined);

    if (dto.scope === EventScope.SERIES && event.seriesId) {
      await this.updateSeries(event, dto);
    } else {
      await this.eventRepository.update(id, {
        type: dto.type ?? event.type,
        title: dto.title ?? event.title,
        opponent: dto.opponent === undefined ? event.opponent : dto.opponent,
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : null,
        description:
          dto.description === undefined ? event.description : dto.description,
      });
    }

    return await this.getByIdWithAttendances(id);
  }

  async setAttendance(
    id: number,
    user: UserEntity,
    dto: EventSetAttendanceDto
  ): Promise<EventEntity> {
    const event: EventEntity = await this.getById(id);
    const isMember: boolean = event.team.members.some(
      (member: TeamMemberEntity): boolean => member.userId === user.id
    );

    if (!isMember) {
      throw new ForbiddenException('Only roster members can mark attendance');
    }

    const existing: EventAttendanceEntity | null =
      await this.eventAttendanceRepository.findByEventAndUser(id, user.id);

    if (existing) {
      await this.eventAttendanceRepository.update(existing.id, {
        status: dto.status,
      });
    } else {
      await this.eventAttendanceRepository.save(
        this.eventAttendanceRepository.create({
          eventId: id,
          userId: user.id,
          status: dto.status,
        })
      );
    }

    return await this.getByIdWithAttendances(id);
  }

  async getMy(user: UserEntity, dto: EventGetListDto): Promise<EventEntity[]> {
    return await this.eventRepository.findByUser(
      user.id,
      dto.from ? new Date(dto.from) : undefined,
      dto.to ? new Date(dto.to) : undefined
    );
  }

  async getForTeam(
    teamId: number,
    user: UserEntity,
    dto: EventGetListDto
  ): Promise<EventEntity[]> {
    const team: TeamEntity = await this.teamService.getById(teamId);

    this.assertCanView(team, user);

    return await this.eventRepository.findByTeam(
      teamId,
      dto.from ? new Date(dto.from) : undefined,
      dto.to ? new Date(dto.to) : undefined
    );
  }

  async getFeed(dto: EventGetFeedDto): Promise<string> {
    const user: UserEntity | null =
      await this.userRepository.findByCalendarToken(dto.token);

    if (!user) {
      throw new NotFoundException('Calendar feed not found');
    }

    const events: EventEntity[] = await this.eventRepository.findByUser(
      user.id
    );

    return this.buildCalendar(events);
  }

  async delete(
    id: number,
    user: UserEntity,
    dto: EventDeleteDto
  ): Promise<null> {
    const event: EventEntity = await this.getById(id);

    this.assertCanManage(event.team, user);

    if (dto.scope === EventScope.SERIES && event.seriesId) {
      await this.eventRepository.deleteSeriesFrom(
        event.seriesId,
        event.startsAt
      );
    } else {
      await this.eventRepository.delete(id);
    }

    return null;
  }

  private async createSeries(
    teamId: number,
    dto: EventCreateDto,
    repeat: EventCreateRepeatDto
  ): Promise<EventEntity> {
    const occurrences: Date[] = this.buildOccurrences(
      new Date(dto.startsAt),
      repeat
    );

    if (occurrences.length === 0) {
      throw new BadRequestException('The series has no occurrences');
    }

    const durationMs: number | null = dto.endsAt
      ? new Date(dto.endsAt).getTime() - new Date(dto.startsAt).getTime()
      : null;
    const seriesId: string = randomUUID();
    const events: EventEntity[] = await this.eventRepository.save(
      occurrences.map(
        (startsAt: Date): EventEntity =>
          this.eventRepository.create({
            teamId,
            type: dto.type,
            title: dto.title,
            opponent: dto.opponent ?? null,
            startsAt,
            endsAt: durationMs
              ? new Date(startsAt.getTime() + durationMs)
              : null,
            description: dto.description ?? null,
            seriesId,
          })
      )
    );

    return await this.getByIdWithAttendances(events[0].id);
  }

  private async updateSeries(
    event: EventEntity,
    dto: EventUpdateDto
  ): Promise<void> {
    const events: EventEntity[] = await this.eventRepository.findSeriesFrom(
      event.seriesId as string,
      event.startsAt
    );
    const startsAtDelta: number = dto.startsAt
      ? new Date(dto.startsAt).getTime() - new Date(event.startsAt).getTime()
      : 0;
    const durationMs: number | null = dto.endsAt
      ? new Date(dto.endsAt).getTime() -
        new Date(dto.startsAt ?? event.startsAt).getTime()
      : null;

    await this.eventRepository.save(
      events.map((occurrence: EventEntity): EventEntity => {
        const startsAt: Date = new Date(
          new Date(occurrence.startsAt).getTime() + startsAtDelta
        );

        occurrence.type = dto.type ?? occurrence.type;
        occurrence.title = dto.title ?? occurrence.title;
        occurrence.opponent =
          dto.opponent === undefined ? occurrence.opponent : dto.opponent;
        occurrence.startsAt = startsAt;
        occurrence.endsAt = this.buildSeriesEndsAt(
          occurrence,
          startsAt,
          startsAtDelta,
          durationMs
        );
        occurrence.description =
          dto.description === undefined
            ? occurrence.description
            : dto.description;

        return occurrence;
      })
    );
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

  private assertCanView(team: TeamEntity, user: UserEntity): void {
    const isMember: boolean = team.members.some(
      (member: TeamMemberEntity): boolean => member.userId === user.id
    );

    if (!isMember && team.game.organization.ownerId !== user.id) {
      throw new ForbiddenException(
        'Only the roster and the organization owner can view the schedule'
      );
    }
  }

  private assertCanManage(team: TeamEntity, user: UserEntity): void {
    if (team.game.organization.ownerId === user.id) {
      return;
    }

    const isManager: boolean = team.members.some(
      (member: TeamMemberEntity): boolean =>
        member.userId === user.id && this.MANAGER_ROLES.includes(member.role)
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

  private buildOccurrences(
    startsAt: Date,
    repeat: EventCreateRepeatDto
  ): Date[] {
    const until: Date = new Date(
      new Date(repeat.until).getTime() + this.DAY_MS
    );

    if (until <= startsAt) {
      throw new BadRequestException('until must be later than startsAt');
    }

    const occurrences: Date[] = [];
    const cursor: Date = new Date(startsAt);

    while (cursor < until) {
      if (repeat.daysOfWeek.includes(cursor.getDay())) {
        occurrences.push(new Date(cursor));

        if (occurrences.length > this.MAX_SERIES_OCCURRENCES) {
          throw new BadRequestException(
            `A series cannot have more than ${this.MAX_SERIES_OCCURRENCES} occurrences`
          );
        }
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return occurrences;
  }

  private buildSeriesEndsAt(
    occurrence: EventEntity,
    startsAt: Date,
    startsAtDelta: number,
    durationMs: number | null
  ): Date | null {
    if (durationMs) {
      return new Date(startsAt.getTime() + durationMs);
    }

    if (occurrence.endsAt) {
      return new Date(new Date(occurrence.endsAt).getTime() + startsAtDelta);
    }

    return null;
  }

  private buildCalendar(events: EventEntity[]): string {
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `PRODID:-//${this.CALENDAR_NAME}//ERP//EN`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${this.CALENDAR_NAME}`,
      ...events.flatMap((event: EventEntity): string[] =>
        this.buildCalendarEvent(event)
      ),
      'END:VCALENDAR',
    ];

    return lines.join('\r\n');
  }

  private buildCalendarEvent(event: EventEntity): string[] {
    const endsAt: Date =
      event.endsAt ??
      new Date(
        new Date(event.startsAt).getTime() + this.DEFAULT_EVENT_DURATION_MS
      );
    const summary: string = [
      `[${event.team.game.organization.tag}]`,
      event.title,
      event.opponent ? `vs ${event.opponent}` : null,
    ]
      .filter(Boolean)
      .join(' ');
    const lines: string[] = [
      'BEGIN:VEVENT',
      `UID:event-${event.id}@${this.CALENDAR_UID_DOMAIN}`,
      `DTSTAMP:${this.formatCalendarDate(event.updatedAt)}`,
      `DTSTART:${this.formatCalendarDate(event.startsAt)}`,
      `DTEND:${this.formatCalendarDate(endsAt)}`,
      `SUMMARY:${this.escapeCalendarText(summary)}`,
      `CATEGORIES:${event.type.toUpperCase()}`,
    ];

    if (event.description) {
      lines.push(`DESCRIPTION:${this.escapeCalendarText(event.description)}`);
    }

    lines.push('END:VEVENT');

    return lines;
  }

  private formatCalendarDate(value: Date): string {
    return new Date(value)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  }

  private escapeCalendarText(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }
}
