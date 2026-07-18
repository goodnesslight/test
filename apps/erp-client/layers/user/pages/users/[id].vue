<script setup lang="ts">
import { navigateTo, useRoute } from 'nuxt/app';
import { computed, type ComputedRef, onMounted, type Ref, ref } from 'vue';

import type { UserProfileDto, UserProfileTeamDto } from '@erp/dtos';
import { type HttpResponse } from '@shared/types';
import { TeamMemberRole } from '@erp/types';

import type { UserService } from '../../composables/use-user-service';

import type { DateService } from '#layers/date';
import type { NotificationService } from '#layers/notification';
import { AppRoute } from '#layers/router';

definePageMeta({
  middleware: 'auth',
});

interface UserProfileStat {
  label: string;
  value: number;
  modifier: string;
}

const { t } = useI18n();
const route: ReturnType<typeof useRoute> = useRoute();
const dateService: DateService = useDateService();
const notificationService: NotificationService = useNotificationService();
const userService: UserService = useUserService();

const ROLE_SEVERITIES: Record<TeamMemberRole, string> = {
  [TeamMemberRole.COACH]: 'warn',
  [TeamMemberRole.PLAYER]: 'success',
};

const userId: number = Number(route.params.id);
const profile: Ref<UserProfileDto | null> = ref(null);
const isLoading: Ref<boolean> = ref(true);

const fullName: ComputedRef<string> = computed((): string =>
  profile.value
    ? [profile.value.firstName, profile.value.lastName]
        .filter(Boolean)
        .join(' ')
    : ''
);
const initial: ComputedRef<string | undefined> = computed(
  (): string | undefined => profile.value?.firstName[0]?.toUpperCase()
);
const attendanceStats: ComputedRef<UserProfileStat[]> = computed(
  (): UserProfileStat[] => {
    if (!profile.value) {
      return [];
    }

    return [
      {
        label: t('players.attendance.going'),
        value: profile.value.attendance.going,
        modifier: 'going',
      },
      {
        label: t('players.attendance.maybe'),
        value: profile.value.attendance.maybe,
        modifier: 'maybe',
      },
      {
        label: t('players.attendance.declined'),
        value: profile.value.attendance.declined,
        modifier: 'declined',
      },
      {
        label: t('players.attendance.total'),
        value: profile.value.attendance.total,
        modifier: 'total',
      },
    ];
  }
);

async function loadProfile(): Promise<void> {
  isLoading.value = true;

  const response: HttpResponse<UserProfileDto> = await userService.getProfile(
    userId
  );

  if (response.isSuccess) {
    profile.value = response.data;
  } else {
    notificationService.showError(response.error);
  }

  isLoading.value = false;
}

async function openTeam(teamId: number): Promise<void> {
  await navigateTo(buildAppRoute(AppRoute.TEAMS_BY_ID, { id: teamId }));
}

onMounted(loadProfile);
</script>

<template>
  <div class="player-page">
    <ProgressSpinner v-if="isLoading" class="player-page__spinner" />

    <template v-else-if="profile">
      <Card>
        <template #content>
          <div class="player-page__header">
            <Avatar
              :image="profile.avatarUrl ?? undefined"
              :label="profile.avatarUrl ? undefined : initial"
              size="xlarge"
              shape="circle"
            />
            <div class="player-page__info">
              <h1>{{ fullName }}</h1>
              <div class="player-page__meta">
                <span>
                  <i class="pi pi-calendar" />
                  {{ t('players.registered') }}:
                  {{ dateService.formatDate(profile.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #title>{{ t('players.attendance.title') }}</template>
        <template #content>
          <p v-if="profile.attendance.total === 0" class="player-page__empty">
            {{ t('players.attendance.empty') }}
          </p>

          <div v-else class="attendance">
            <div class="attendance__rate">
              <span class="attendance__rate-value">
                {{ profile.attendance.rate }}%
              </span>
              <span class="attendance__rate-label">
                {{ t('players.attendance.rate') }}
              </span>
            </div>
            <div class="attendance__breakdown">
              <div
                v-for="stat in attendanceStats"
                :key="stat.modifier"
                class="attendance__stat"
                :class="`attendance__stat--${stat.modifier}`"
              >
                <span class="attendance__stat-value">{{ stat.value }}</span>
                <span class="attendance__stat-label">{{ stat.label }}</span>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #title>{{ t('players.teams') }}</template>
        <template #content>
          <div v-if="profile.teams.length === 0" class="player-page__empty">
            {{ t('players.noTeams') }}
          </div>

          <div v-else class="player-teams">
            <button
              v-for="entry in profile.teams"
              :key="entry.teamId"
              type="button"
              class="player-team"
              @click="openTeam(entry.teamId)"
            >
              <span class="player-team__top">
                <Tag
                  v-if="entry.team.game?.organization"
                  :value="entry.team.game.organization.tag"
                  severity="secondary"
                />
                <span class="player-team__name">
                  {{ t(`teams.types.${entry.team.type}`) }}
                </span>
              </span>
              <span v-if="entry.team.game" class="player-team__game">
                <i :class="getGameIcon(entry.team.game.type)" />
                {{ getGameLabel(entry.team.game.type) }}
              </span>
              <Tag
                :value="t(`teams.roles.${entry.role}`)"
                :severity="ROLE_SEVERITIES[entry.role]"
              />
            </button>
          </div>
        </template>
      </Card>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.player-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__spinner {
    align-self: center;
    margin-top: 4rem;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    h1 {
      font-size: 1.4rem;
    }
  }

  &__fullname {
    color: $text-secondary;
    font-size: 1rem;
  }

  &__meta {
    display: flex;
    gap: 1.5rem;
    margin-top: 0.25rem;
    color: $text-dim;
    font-size: 0.9rem;

    .pi {
      margin-right: 0.3rem;
      color: $accent;
    }
  }

  &__empty {
    padding: 1rem 0;
    color: $text-dim;
    font-size: 0.9rem;
  }

  @media (max-width: $mobile) {
    &__header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
}

.attendance {
  display: flex;
  align-items: center;
  gap: 2rem;

  &__rate {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  &__rate-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: $accent;
  }

  &__rate-label {
    color: $text-dim;
    font-size: 0.85rem;
  }

  &__breakdown {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
    flex: 1;
  }

  &__stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.85rem 0.5rem;
    background: $bg-card-alt;
    border: 1px solid $border;
    border-radius: 12px;

    &--going .attendance__stat-value {
      color: $color-win;
    }

    &--maybe .attendance__stat-value {
      color: $color-warn;
    }

    &--declined .attendance__stat-value {
      color: $color-loss;
    }
  }

  &__stat-value {
    font-size: 1.4rem;
    font-weight: 600;
  }

  &__stat-label {
    color: $text-dim;
    font-size: 0.8rem;
  }

  @media (max-width: $mobile) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;

    &__breakdown {
      width: 100%;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

.player-teams {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.player-team {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 1.1rem 1.2rem;
  background: $bg-card-alt;
  border: 1px solid $border;
  border-radius: 14px;
  color: $text-primary;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    background: $bg-card-hover;
    border-color: $accent-border;
  }

  &__top {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  &__name {
    font-size: 1rem;
    font-weight: 600;
  }

  &__game {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: $text-dim;
    font-size: 0.9rem;

    .pi {
      color: $accent;
    }
  }
}
</style>
