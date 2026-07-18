<script setup lang="ts">
import { navigateTo } from 'nuxt/app';
import { computed, type ComputedRef } from 'vue';

import type { AdminDto } from '@backoffice/dtos';

import type { AuthService } from '#layers/auth';
import { AppRoute } from '#layers/router';

const authService: AuthService = useAuthService();

const admin: ComputedRef<AdminDto | null> = computed(
  (): AdminDto | null => authService.admin.value
);
const displayName: ComputedRef<string> = computed(
  (): string => admin.value?.firstName || admin.value?.email || ''
);

async function logout(): Promise<void> {
  await authService.logout();
  await navigateTo(AppRoute.LOGIN);
}
</script>

<template>
  <div class="layout">
    <Toast />
    <ConfirmDialog />

    <header class="topbar">
      <NuxtLink :to="AppRoute.HOME" class="brand">
        <span class="brand__icon">
          <i class="pi pi-shield" />
        </span>
        <span class="brand__name">Backoffice</span>
      </NuxtLink>

      <nav v-if="admin" class="nav">
        <NuxtLink
          :to="AppRoute.HOME"
          class="nav__item"
          exact-active-class="nav__item--active"
        >
          <i class="pi pi-building" />
          <span>Организации</span>
        </NuxtLink>
        <NuxtLink
          :to="AppRoute.REQUESTS"
          class="nav__item"
          active-class="nav__item--active"
        >
          <i class="pi pi-inbox" />
          <span>Заявки</span>
        </NuxtLink>
      </nav>

      <div v-if="admin" class="topbar__user">
        <span class="topbar__name">{{ displayName }}</span>
        <Button
          icon="pi pi-sign-out"
          label="Выйти"
          severity="secondary"
          text
          @click="logout"
        />
      </div>
    </header>

    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  height: 68px;
  padding: 0 2rem;
  border-bottom: 1px solid $border;
  background: $bg-sidebar;

  &__user {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-left: auto;
  }

  &__name {
    font-size: 0.92rem;
    font-weight: 500;
    color: $text-secondary;
  }
}

.nav {
  display: flex;
  align-items: center;
  gap: 0.35rem;

  &__item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.85rem;
    border-radius: 10px;
    border: 1px solid transparent;
    color: $text-dim;
    font-size: 0.92rem;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.15s, color 0.15s, border-color 0.15s;

    .pi {
      font-size: 0.95rem;
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

.brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: $text-primary;
  text-decoration: none;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: $accent;
    color: #fff;
  }

  &__name {
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
}

.content {
  flex: 1;
  padding: 2rem;
}

@media (max-width: $mobile) {
  .topbar {
    padding: 0 1rem;
  }

  .content {
    padding: 1rem;
  }
}
</style>
