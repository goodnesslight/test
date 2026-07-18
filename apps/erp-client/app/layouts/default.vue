<script setup lang="ts">
import { navigateTo } from 'nuxt/app';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import {
  computed,
  type ComputedRef,
  onMounted,
  type Ref,
  ref,
  watch,
} from 'vue';

import type { OrganizationDto, UserDto } from '@erp/dtos';

import type { AuthService } from '#layers/auth';
import type { LocaleService } from '#layers/i18n';
import type { InviteService } from '#layers/invite';
import type { OrganizationService } from '#layers/organization';
import { AppRoute } from '#layers/router';

const { t } = useI18n();
const authService: AuthService = useAuthService();
const inviteService: InviteService = useInviteService();
const localeService: LocaleService = useLocaleService();
const organizationService: OrganizationService = useOrganizationService();

const organization: ComputedRef<OrganizationDto | null> = computed(
  (): OrganizationDto | null => organizationService.current.value
);

const profileMenu: Ref<InstanceType<typeof Menu> | null> = ref(null);

const user: ComputedRef<UserDto | null> = computed(
  (): UserDto | null => authService.user.value
);
const greetingName: ComputedRef<string> = computed(
  (): string => user.value?.firstName ?? ''
);
const fullName: ComputedRef<string> = computed(
  (): string => formatUserName(user.value)
);
const profileMenuItems: ComputedRef<MenuItem[]> = computed((): MenuItem[] => [
  {
    label: t('nav.profile'),
    icon: 'pi pi-user',
    command: (): void => {
      void navigateTo(AppRoute.SETTINGS);
    },
  },
  { separator: true },
  {
    label: t('nav.logout'),
    icon: 'pi pi-sign-out',
    command: (): void => {
      void logout();
    },
  },
]);

watch(
  user,
  (value: UserDto | null): void => {
    if (value && import.meta.client) {
      void inviteService.getMyPending();
      localeService.apply(value.locale);
    }
  },
  { immediate: true }
);

function toggleProfileMenu(event: MouseEvent): void {
  profileMenu.value?.toggle(event);
}

async function logout(): Promise<void> {
  await authService.logout();
  await navigateTo(AppRoute.LOGIN);
}

onMounted((): void => {
  localeService.restore();
});
</script>

<template>
  <div class="layout">
    <Toast />
    <ConfirmDialog />

    <aside class="sidebar">
      <NuxtLink :to="AppRoute.HOME" class="brand">
        <Avatar
          v-if="organization?.logoUrl"
          :image="organization.logoUrl"
          shape="circle"
        />
        <span v-else class="brand__icon">
          <i class="pi pi-th-large" />
        </span>
        <span class="brand__name">{{
          organization?.name ?? t('nav.brand')
        }}</span>
      </NuxtLink>

      <nav class="nav">
        <span class="nav__label">{{ t('nav.section') }}</span>
        <NuxtLink
          :to="AppRoute.HOME"
          class="nav__item"
          exact-active-class="nav__item--active"
        >
          <i class="pi pi-home" />
          <span>{{ t('nav.dashboard') }}</span>
        </NuxtLink>
        <NuxtLink
          :to="AppRoute.CALENDAR"
          class="nav__item"
          active-class="nav__item--active"
        >
          <i class="pi pi-calendar" />
          <span>{{ t('nav.calendar') }}</span>
        </NuxtLink>
      </nav>
    </aside>

    <div class="main">
      <header class="topbar">
        <h2 v-if="user" class="topbar__greeting">
          {{ t('nav.greeting', { username: greetingName }) }} 👋
        </h2>
        <div v-if="user" class="topbar__user">
          <NuxtLink
            :to="AppRoute.INVITES"
            class="topbar__bell"
            :aria-label="t('invites.title')"
          >
            <OverlayBadge
              v-if="inviteService.pendingCount.value > 0"
              :value="String(inviteService.pendingCount.value)"
              severity="danger"
              size="small"
            >
              <i class="pi pi-bell" />
            </OverlayBadge>
            <i v-else class="pi pi-bell" />
          </NuxtLink>
          <button
            type="button"
            class="topbar__profile"
            :aria-label="t('nav.profile')"
            @click="toggleProfileMenu"
          >
            <Avatar
              :image="user.avatarUrl ?? undefined"
              :label="
                user.avatarUrl ? undefined : user.firstName[0]?.toUpperCase()
              "
              shape="circle"
            />
            <span class="topbar__username">{{ fullName }}</span>
            <i class="pi pi-angle-down topbar__chevron" />
          </button>
          <Menu ref="profileMenu" :model="profileMenuItems" popup />
        </div>
      </header>

      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  display: flex;
  flex-direction: column;
  width: 250px;
  flex-shrink: 0;
  padding: 1.5rem 1.25rem;
  background: $bg-sidebar;
  border-right: 1px solid $border;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: $text-primary;
  text-decoration: none;
  margin-bottom: 2.5rem;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 11px;
    background: $accent;
    color: #fff;
    font-size: 1.05rem;
  }

  &__name {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  &__label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: $text-muted;
    margin-bottom: 0.6rem;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.7rem 1rem;
    border-radius: 12px;
    border: 1px solid transparent;
    color: $text-dim;
    font-size: 0.95rem;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.15s, color 0.15s, border-color 0.15s;

    .pi {
      font-size: 1rem;
    }

    &:hover {
      background: $bg-card-hover;
      color: $text-primary;
    }

    &--active {
      background: $accent-soft;
      border-color: $accent-border;
      color: $text-primary;

      .pi {
        color: $accent;
      }
    }
  }
}

.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  height: 76px;
  padding: 0 2rem;
  border-bottom: 1px solid $border;

  &__greeting {
    font-size: 1.25rem;
    font-weight: 600;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    margin-left: auto;
  }

  &__bell {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    margin-right: 0.35rem;
    border-radius: 10px;
    color: $text-dim;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;

    .pi {
      font-size: 1.1rem;
    }

    &:hover {
      background: $bg-card-hover;
      color: $text-primary;
    }
  }

  &__profile {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.35rem 0.6rem;
    background: transparent;
    border: none;
    border-radius: 10px;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: $bg-card-hover;
    }
  }

  &__username {
    font-size: 0.92rem;
    font-weight: 500;
    color: $text-secondary;
  }

  &__chevron {
    font-size: 0.8rem;
    color: $text-muted;
  }
}

.content {
  flex: 1;
  padding: 2rem;
}

@media (max-width: $mobile) {
  .layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    align-items: center;
    padding: 0.75rem 1rem;
    border-right: none;
    border-bottom: 1px solid $border;

    .brand {
      margin-bottom: 0;
      margin-right: 1.25rem;
    }

    .nav {
      flex-direction: row;
      align-items: center;

      &__label {
        display: none;
      }

      &__item {
        padding: 0.5rem 0.85rem;
      }
    }
  }

  .topbar {
    height: auto;
    padding: 0.85rem 1rem;

    &__greeting {
      font-size: 1.05rem;
    }
  }

  .content {
    padding: 1rem;
  }
}
</style>
