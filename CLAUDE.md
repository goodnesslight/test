# Project Conventions

## File member order

Within every file, declarations must always follow this order:

1. Exported types
2. Internal (non-exported) types
3. Exported constants
4. Internal constants
5. Exported functions
6. Internal functions
7. Exported classes
8. Internal classes

## Class member order

Applies to every class in the project (services, controllers, repositories, etc.):

- **Visibility groups:** `public` → `protected` → `private`. Fields follow the same visibility order and go before the constructor; methods go after it.
- **Within a visibility group, methods follow CRUD-like action order:** `create` → `update` → `set`/other mutating actions → `get`/`find` → `delete`/`remove`. Domain-flow methods (e.g. `register`/`login`/`refresh`/`logout`) keep their natural flow order.
- In controllers, route-matching specificity wins over this order when they conflict (a static segment route like `GET my` must stay declared before `GET :id`).

## Property order in classes and interfaces

In DTOs, interfaces, entities and similar shape-describing objects, declare properties in this order:

1. Required properties with exact types (`id: number`, `title: string`)
2. Nullable properties (`opponent: string | null`)
3. Optional properties (`user?: UserDto`)

## Alphabetical order in lists

Keep registration/re-export lists sorted alphabetically:

- Barrel files (`index.ts`): `export * from '...'` lines sorted by path (`./auth` → `./event` → `./invite` → …).
- NestJS module `imports` arrays: feature modules sorted alphabetically (`AuthModule`, `EventModule`, `InviteModule`, `OrganizationModule`, `TeamModule`, `UserModule`). Infrastructure/config modules (`ConfigModule`, `ScheduleModule`, `CacheModule`, `DatabaseModule`) stay first as their own group.
- The same applies to any similar list (providers, exports, plugin registrations): new entries go in alphabetical position, not at the end.

## API module structure (`apps/website-api/src/modules`)

- Files named after the module itself live at the module root: `team/team.module.ts`, `team/team.entity.ts`, `team/team.service.ts`, etc.
- **Sub-entity files get their own subfolder** named after the sub-entity. Any file whose name differs from the module name (a nested/secondary entity) goes into `modules/<module>/<sub-entity>/`: e.g. `team/team-member/team-member.entity.ts`, `team/team-member/team-member.repository.ts`, `event/event-attendance/event-attendance.entity.ts`.
- **Constructor injection order:** services first, then repositories (own module's main repository first, then sub-entity/foreign repositories), then low-level infrastructure (`DataSource`, etc.):

  ```ts
  constructor(
    private readonly teamService: TeamService,
    private readonly eventRepository: EventRepository,
    private readonly eventAttendanceRepository: EventAttendanceRepository
  ) {}
  ```

- **Thin controllers — no logic in controllers, everything lives in services.** A handler body is a single delegation: `return await this.someService.method(...)`. No branching, no cookie/token work, no `return null` after a void call (the service returns `null` itself), no building responses. When HTTP primitives are needed (cookies, redirects), pass `request`/`response` through to the service and let it do the work there.
- **Route paths come from the shared `ApiRoute` enum** (`@shared/types`). Never hand-write route strings in controller decorators: `@Delete(ApiRoute.TEAM_MEMBERS_BY_ID)`, not `@Delete('teams/:id/members/:memberId')`.
- **Parameter order in controller handlers and service methods:** entity ids first (in path order: `id` → `memberId`), then `user`, then `dto`:

  ```ts
  async updateMemberRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @CurrentUser() user: UserEntity,
    @Body() dto: TeamUpdateMemberDto
  ): Promise<TeamEntity> {
    return await this.teamService.updateMemberRole(id, memberId, user, dto);
  }
  ```

- **Pass whole objects, never their fields.** Controllers never pass `user.id` or individual dto fields into services — always the full `UserEntity` and the full DTO (query DTOs included: pass `dto`, not `dto.from, dto.to`). Services take the full objects and read `user.id` internally. The same applies to service-to-service calls.
- **No file-level constants in class files** (services, controllers, etc.). A constant belongs either in the module's `<module>.const.ts` file (when shared/reusable) or as a `private readonly` class member (when used by a single class). Never declare a bare `const` above a class:

  ```ts
  // ❌ const MANAGER_ROLES: TeamMemberRole[] = [...] above the class
  // ✅ private readonly MANAGER_ROLES: TeamMemberRole[] = [...] inside the class
  // ✅ export const MANAGER_ROLES in event.const.ts
  ```

  Constant-like `private readonly` class members are named in `UPPER_CASE`, same as regular constants (`private readonly MANAGER_ROLES`, not `managerRoles`).

## Shared DTOs (`libs/shared/dtos`)

- **One file per domain.** All DTOs for a domain live in a single file named after the domain: `libs/shared/dtos/src/<domain>.ts` (e.g. `event.ts`, `auth.ts`, `team.ts`). Do not create per-DTO files or domain subfolders.
- **Domain prefix in type names.** Every type in a domain file must start with the domain name in PascalCase: `auth.ts` → `AuthLoginDto`, `AuthRegisterDto`; `event.ts` → `EventDto`, `EventCreateDto`, `EventSetAttendanceDto`.
- Re-export every domain file from `src/index.ts` (`export * from './<domain>';`).
- **Logical DTO order inside a domain file.** The main entity DTO comes first, then related/nested entity DTOs, then action/request DTOs in CRUD order: `EventDto` → `EventAttendanceDto` → `EventCreateDto` → `EventUpdateDto` → remaining query/action DTOs (e.g. `EventGetListDto`, `EventSetAttendanceDto`).

## Shared types (`libs/shared/types`)

Same rules as shared DTOs:

- **One file per domain:** `libs/shared/types/src/<domain>.ts` (e.g. `event.ts`, `team.ts`, `http.ts`). No `.type` suffix, no per-type files.
- **Domain prefix in type names:** every type/enum must start with the domain name in PascalCase: `event.ts` → `EventType`, `EventAttendanceStatus`; `http.ts` → `HttpMethod`, `HttpResponse`. If a type doesn't fit the domain prefix, it belongs to its own domain file (e.g. `GameType` lives in `game.ts`, not `team.ts`).
- Re-export every domain file from `src/index.ts`.
- **Logical order inside a file:** the main domain type first, then related/secondary types.
