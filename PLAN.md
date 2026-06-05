# План разработки — Платформа для киберспортивных команд

> Стек (уже в репо): Nx-монорепа · NestJS + TypeORM (PostgreSQL) + Redis · Nuxt 4 (Vue 3) · shared-либы (`@shared/dtos`, `@shared/types`, `@shared/utils`)

## Цель MVP

Платформа, где киберспортивная команда регистрируется, ведёт состав, расписание тренировок/матчей и базовую статистику.

---

## Фича 1 — Авторизация и аккаунты 🔑

Фундамент для всего остального. Зависимости (`@nestjs/jwt`, `passport-jwt`, `passport-steam`, `cookie-parser`) уже стоят.

**Backend (`website-api`)**
- [x] Entity `User` (id, email, passwordHash, username, avatar, steamId?, createdAt) + миграция
- [x] `AuthModule`: регистрация (email + пароль, argon2), логин
- [x] JWT: access-токен (15 мин) + refresh-токен в httpOnly cookie, ротация refresh-токенов (хранятся в Redis)
- [x] `JwtAuthGuard` + декоратор `@CurrentUser()`
- [x] Google OAuth логин (`passport-google-oauth20`) — линкуется к существующему аккаунту по email; без ключей API стартует, роут отдаёт 503
- [x] Эндпоинты: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`, `GET /auth/google` + callback
- [x] DTO с валидацией в `@shared/dtos` (переиспользуем на клиенте)

**Frontend (`website-client`)**
- [x] Страницы `/login`, `/register` (PrimeVue)
- [x] Composable `useAuthService()` (state юзера, login/logout/refresh/me)
- [x] Route middleware `auth` + `guest` для защищённых страниц
- [x] Кнопка «Войти через Google»

---

## Фича 2 — Организации и команды 🛡️

> Иерархия: **Организация** (например, NaVi) → **команды по играм** (CS2, Dota 2, ...)

**Backend**
- [x] Entity `Organization` (id, name, tag, logoUrl, ownerId, createdAt)
- [x] Entity `Team` (id, organizationId, name, game, createdAt) — принадлежит организации
- [x] Entity `TeamMember` (teamId, userId, role: coach/captain/player/substitute)
- [x] CRUD организаций (управление — только owner), «мои организации» включают членство в составах
- [x] Команды создаются внутри организации, управление — owner организации
- [x] Эндпоинты: `POST/GET/PUT/DELETE /organizations(/:id)`, `GET /organizations/my`, `POST /organizations/:id/teams`, `GET/PUT/DELETE /teams/:id`

**Frontend**
- [x] Список «Мои организации» (DataTable) + диалог создания/редактирования
- [x] Страница организации: профиль + сетка команд + создание команды
- [x] Страница команды: хлебная крошка в организацию, игра, состав с ролями
- [x] Дашборд: плитки Организации/Команды/Игроки + список организаций

---

## Фича 3 — Состав и приглашения 📨

**Backend**
- [x] Entity `TeamInvite` (teamId, invitedUserId, status: pending/accepted/declined, role) + partial-unique на pending
- [x] Приглашение игрока по username/email (owner организации), принятие/отклонение, отзыв
- [x] Управление составом: смена роли игрока (owner), кик (owner), выход из команды (сам игрок)
- [x] Эндпоинты: `POST/GET /teams/:id/invites`, `GET /invites/my`, `POST /invites/:id/accept|decline`, `DELETE /invites/:id`, `PUT/DELETE /teams/:id/members/:memberId`

**Frontend**
- [x] Карточка «Состав» на странице команды (смена роли инлайн-селектом, кик/выход, ожидающие инвайты с отзывом)
- [x] Модалка приглашения игрока (ник/email + роль)
- [x] Страница `/invites` + колокольчик со счётчиком в шапке

---

## Фича 4 — Расписание: тренировки и матчи 📅

**Backend**
- [x] Entity `Event` (teamId, type: practice/scrim/match/tournament, title, opponent?, startsAt, endsAt?, description)
- [x] Entity `EventAttendance` (eventId, userId, status: going/maybe/declined, unique на пару) — отметка посещаемости
- [x] CRUD событий (owner организации / coach / captain), расписание видят только состав и owner
- [x] Эндпоинты: `POST /teams/:id/events`, `GET /teams/:id/events?from=&to=`, `PUT /events/:id`, `DELETE /events/:id`, `POST /events/:id/attendance`

**Frontend**
- [x] Карточка «Расписание» на странице команды (предстоящие + сворачиваемые прошедшие)
- [x] Диалог события (тип, название, соперник, дата/время через DatePicker, описание)
- [x] Кнопки «иду / возможно / не иду» + счётчики посещаемости по событию

---

## Фича 5 — Результаты матчей и базовая статистика 📊

**Backend**
- [ ] Entity `MatchResult` (eventId, score, result: win/loss/draw, mapName?, vodUrl?, notes)
- [ ] Запись результата к событию типа match/scrim
- [ ] Агрегированная статистика команды: win rate, последние матчи, статистика по картам
- [ ] Эндпоинты: `POST /events/:id/result`, `GET /teams/:id/stats`
- [ ] Кэшировать агрегаты в Redis (инвалидация при новом результате)

**Frontend**
- [ ] Форма внесения результата после матча
- [ ] Вкладка «Статистика» на странице команды (win rate, история матчей)
- [ ] Виджет последних результатов на дашборде

---

## Дополнительно — Личный кабинет ⚙️ (сделано вне исходного плана)

- [x] Поля `firstName`, `lastName`, `locale` (ru/en) у юзера + миграция
- [x] `PUT /users/me` (имя, фамилия, язык), `POST /users/me/avatar` (multipart, PNG/JPEG/WEBP до 2 МБ, диск + раздача `/uploads`)
- [x] Страница `/settings`: аватар с загрузкой, имя/фамилия, переключатель языка интерфейса
- [x] Язык применяется на лету, хранится в профиле + localStorage (работает и до логина)
- [x] Пункт «Настройки» в сайдбаре (секция «Прочее»), приветствие в шапке по имени

## Порядок работы

```
1. Auth ──► 2. Teams ──► 3. Roster ──► 4. Schedule ──► 5. Stats
   (всё остальное зависит)              (зависит от teams)
```

Каждая фича = отдельная ветка + миграция + минимум e2e-тест на happy path.

## Что сознательно отложено (после MVP)

- Загрузка файлов (лого/аватары) — пока URL-строки
- Интеграции с игровыми API (Steam stats, FACEIT, etc. — `gamedig` уже в зависимостях, пригодится)
- Уведомления (email / Discord webhook)
- Турниры и брекеты
- Публичные профили игроков и поиск команд (LFG)
- Чат / тактическая доска
