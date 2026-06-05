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
