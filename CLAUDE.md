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

## API module structure (`apps/erp-api/src/modules`)

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

- **Auth strategies and guards share the `<scheme>-auth` name.** A strategy file is named like its guard: `jwt-auth.strategy.ts` (`JwtAuthStrategy`) pairs with `jwt-auth.guard.ts` (`JwtAuthGuard`), `google-auth.strategy.ts` (`GoogleAuthStrategy`) with `google-auth.guard.ts` (`GoogleAuthGuard`) — not `jwt.strategy.ts`/`JwtStrategy`.
- **Thin controllers — no logic in controllers, everything lives in services.** A handler body is a single delegation: `return await this.someService.method(...)`. No branching, no cookie/token work, no `return null` after a void call (the service returns `null` itself), no building responses. When HTTP primitives are needed (cookies, redirects), pass `request`/`response` through to the service and let it do the work there.
- **Route paths come from the shared `ApiRoute` enum** (`@shared/types`). Never hand-write route strings in controller decorators: `@Delete(ApiRoute.TEAM_MEMBERS_BY_ID)`, not `@Delete('teams/:id/members/:memberId')`. This applies everywhere a path is built, including auth strategies (`callbackURL: \`${origin}/api/${ApiRoute.AUTH_GOOGLE_CALLBACK}\``).
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

## API routes (`ApiRoute` enum in `libs/shared/types/src/api.ts`)

- **Key naming — plural vs singular prefix.** Plural when the route hangs on the collection root (`ORGANIZATIONS`, `ORGANIZATIONS_MY`, `ORGANIZATIONS_BY_ID`, `EVENTS_BY_ID`); singular when the route hangs under one entity, i.e. after `:id/...` (`ORGANIZATION_TEAMS`, `TEAM_EVENTS`, `INVITE_ACCEPT`, `EVENT_ATTENDANCE`).
- **Group order:** `AUTH` first (infrastructure group, like `ConfigModule` in module imports), then resource groups alphabetically (`EVENTS` → `INVITES` → `ORGANIZATIONS` → `TEAMS` → `USERS`). Groups are separated by a blank line; no header comments — the key prefix is the header.
- **Order inside a group:** collection root (`organizations`) → static segments (`organizations/my`) → `:id` route (`organizations/:id`) → nested sub-resources/actions under `:id`, alphabetically (`TEAM_EVENTS` → `TEAM_INVITES` → `TEAM_MEMBERS_BY_ID`). Auth keeps natural flow order (`register` → `login` → `refresh` → `logout` → `google` → `google/callback`).
- **Path parameter naming:** the first path parameter is always `:id` — also in nested routes (`teams/:id/events`, `organizations/:id/teams`); deeper parameters are named after their entity (`teams/:id/members/:memberId`). Handlers alias `:id` to a descriptive variable when needed: `@Param('id', ParseIntPipe) teamId: number`.
- Routes are grouped by URL prefix, not by serving controller (`TEAM_EVENTS` is served by `EventController` — that's fine; the enum is a map of the URL space, not of modules).
- OAuth callback routes are named `callback` (`auth/google/callback`), not `return`.

## Client layer structure (`apps/erp-client/layers`)

The client mirrors the API's modularity: **one Nuxt layer = one module**. Layers in `layers/` are auto-registered by Nuxt 4 — no manual `extends` lists (no `extends` in the root `nuxt.config.ts`, no `layers/nuxt.config.ts`).

- **Two layer groups**, like infrastructure vs feature modules on the API:
  - infrastructure: `api`, `config`, `date`, `i18n`, `logger`, `notification`, `router`, `storage`;
  - domain: `auth`, `event`, `game`, `invite`, `organization`, `team`, `user` — these mirror API modules 1:1. A new API module gets a client layer of the same name.
- **`app/` is the shell only**: `app.vue`, `layouts/default.vue` and cross-domain pages (the dashboard `pages/index.vue`). Everything that belongs to a domain lives in that domain's layer — components, pages, middleware and layouts included (the `auth` layer owns `login.vue`/`register.vue`, the `auth` layout and the `auth`/`guest` middleware).
- **Layer anatomy** (flat — no `app/` subdirectory inside a layer):

  ```
  layers/<name>/
  ├── nuxt.config.ts   # required, minimal (empty defineNuxtConfig)
  ├── index.ts         # barrel: the layer's public types/enums
  ├── components/      # <name>-*.vue
  ├── composables/     # use-<name>-service.ts, use-*.ts
  ├── constants/       # index.ts
  ├── layouts/  middleware/  pages/  plugins/  types/  utils/   # as needed
  ```

- Component files are kebab-case and **prefixed with their layer name** (`team/components/team-roster-card.vue` → `<TeamRosterCard>`), which keeps Nuxt's auto-registered component names globally unique. Pages mirror the URL space: `organization/pages/organizations/[id].vue`.
- **No file-level constants in composables, components or plugins** (same rule as API class files). Layer-level constants live in `constants/index.ts` (`GAME_LABELS`, `DEFAULT_LOCALE`); inside `<script setup>` UPPER_CASE constants are allowed (component scope ≈ class scope). A module-level singleton backing a composable (e.g. the consola instance) is allowed in the composable file.
- The barrel `index.ts` exports the layer's public surface, lines sorted by path: `export type { XService } from './composables/use-x-service';`, then `export * from './types';` for value-bearing enums.

## Client services (composables)

- One service per layer: `composables/use-<name>-service.ts` exports `interface <Name>Service` plus `function use<Name>Service(): <Name>Service`. File order: exported interface first, then the composable; helpers are inner functions of the composable; the returned object lists members in interface order.
- **A domain service mirrors its API controller 1:1** — same methods, same names, same CRUD order — with one mapping: controller `delete` → service `remove` (reserved word). Services map to domains, not URLs: team creation is `TeamService.create(organizationId, dto)` because `POST organizations/:id/teams` is served by `TeamController`.
- Parameter order matches the API: entity ids first (in path order), then dto: `updateMemberRole(teamId, memberId, dto)`.
- **Pass whole objects.** Callers build a DTO variable typed with the shared DTO class (`const dto: TeamCreateDto = { name: name.value, game: game.value };`) and pass it whole — never inline anonymous payload types, never pass individual fields. Query DTOs too: `getForTeam(teamId, dto?: EventGetListDto)`.
- `ApiService` calls merge path params with the dto spread: `apiService.put<TeamDto>(ApiRoute.TEAM_MEMBERS_BY_ID, { id: teamId, memberId, ...dto })`. Its HTTP verb methods follow CRUD order: `post` → `put` → `get` → `delete`.
- **Shared reactive state lives in the owning service** via `useState('<layer>:<property>')` (`auth:user`, `invite:pendingCount`) and is mutated only by that service; consumers read it through the service (`inviteService.pendingCount`). A get method may refresh its own state as a side effect (`getMyPending` updates `pendingCount`), like `login` sets `user`.
- Cross-cutting UI duties go through infrastructure services and are never re-implemented locally: toasts → `useNotificationService` (`showSuccess`/`showError` — no raw `toast.add` in components), date formatting → `useDateService`, locale switching → `useLocaleService`, config → `useConfigService`, storage → `useStorageService`.

## Client routes (`AppRoute` enum in `layers/router/types`)

- `AppRoute` maps the client URL space exactly like `ApiRoute` maps the API's. **Never hand-write route strings** in `navigateTo`, `:to` or middleware. Static routes: `navigateTo(AppRoute.ORGANIZATIONS)`; dynamic routes: `buildAppRoute(AppRoute.TEAMS_BY_ID, { id })` (auto-imported util from `layers/router/utils`).
- Key naming, grouping and order follow the `ApiRoute` rules: `HOME` first, then the auth flow (`LOGIN`, `REGISTER`), then resource groups alphabetically, groups separated by a blank line; path parameters are named `:id`.

## Client imports

Four kinds of imports, each done one way:

1. **Framework APIs** — explicit imports from `vue`, `nuxt/app`, `primevue/*`, `consola` (`useI18n` comes from the auto-import preset and is not imported).
2. **Shared libs** — explicit `@shared/*`.
3. **Layer types/enums/constants** — explicit from the layer barrel via the built-in alias: `import type { AuthService } from '#layers/auth';`. Inside the owning layer use relative paths (`../types`, `../composables/use-team-service`) — never a layer's own barrel (cycle risk).
4. **Composables and utils** — auto-imported (`imports.dirs`: `~~/layers/**/composables`, `~~/layers/**/utils`); never import `useXService` or `buildAppRoute` manually.

Import group order is enforced by `simple-import-sort`: framework/external → `@shared/*` → relative → `#layers/*`, blank line between groups, alphabetical within a group.

## Client components (`<script setup>`)

Declaration order inside `<script setup lang="ts">`:

1. `definePageMeta`
2. local interfaces: `<Component>Props` → `<Component>Emits` → option types (`EventTypeOption`)
3. `defineProps` / `defineEmits` (`const props: XProps = defineProps<XProps>();`)
4. composable injections: framework first (`useI18n`, `useRoute`, `useConfirm`), then services alphabetically (`const teamService: TeamService = useTeamService();`)
5. UPPER_CASE constants (`ROLE_SEVERITIES`)
6. state: `ref`s and plain derived consts (`const teamId: number = Number(route.params.id);`)
7. `computed`
8. `watch`
9. functions (flow order: loaders → actions → helpers)
10. lifecycle hooks (`onMounted`)

- Everything is explicitly typed, including refs (`const isLoading: Ref<boolean> = ref(false);`), callback parameters and return types.
- Anything whose value depends on locale or other reactive state is a `computed` — option lists built with `t()` included (`useTeamRoleOptions()` returns `ComputedRef<TeamRoleOption[]>`).

## Client i18n (`layers/i18n/locales`)

- Central locale files `en.json`/`ru.json` in the i18n layer; **one top-level namespace per domain or shell area**: `common` first, then alphabetical (`auth`, `dashboard`, `events`, `invites`, `nav`, `organizations`, `settings`, `teams`). Sub-keys belong to their domain namespace (`teams.roles.*`, `events.types.*`) — no orphan top-level groups.
- `en.json` and `ru.json` must stay structurally identical (same keys, same nesting).

## Client styles

- Design tokens come only from `assets/scss/_variables.scss` (auto-injected via `@use "variables" as *`); no hardcoded colors or breakpoints in components (`$accent`, `$text-dim`, `$mobile`).
- BEM class naming (`block__element--modifier`); every component uses `<style lang="scss" scoped>`; global styles live only in `app.vue`.

## Migrations (`apps/erp-api/migrations`)

- **One migration = one complete action.** A migration covers exactly one feature/action in full — and nothing else. Never bundle unrelated entities into one migration (no `auth-organizations-teams`-style migrations).
- "Complete" means the migration carries everything its action needs: the table plus its enums, indexes, constraints and sub-entity tables. Sub-entities go in the same migration as their parent module (e.g. `team-create` includes `team_members`, `event-create` includes `event_attendances`).
- A shared enum is created in the migration of the first module that uses it (`team_member_role` is created in `team-create`; `invite-create` just references it).
- **File naming:** `<timestamp>-<resource>-<action>.ts`, singular resource first, then the action: `1780444800000-user-create.ts`, `<timestamp>-user-add-profile.ts`. Class name mirrors it in PascalCase + timestamp: `UserCreate1780444800000`.
- **While a migration has not been run anywhere, edit it in place** instead of stacking a new alter-migration on top (no `user-create` + `user-add-profile` pairs for unreleased schema).
- `down()` reverses `up()` exactly, in reverse statement order.

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
