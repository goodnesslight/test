<script setup lang="ts">
import IconLogout from './icons/IconLogout.vue';
import IconProfile from './icons/IconProfile.vue';
import IconSteam from './icons/IconSteam.vue';

const authService: AuthService = useAuthService();
</script>

<template>
  <div class="sidebar-auth">
    <template v-if="authService.isLoggedIn.value">
      <NuxtLink
        :to="`/profile/${authService.accountId.value}`"
        class="sidebar-auth-profile"
      >
        <IconProfile />
        <span>{{ $t('sidebar.navItems.profile') }}</span>
      </NuxtLink>
      <button class="sidebar-auth-logout" @click="authService.logout">
        <IconLogout />
        <span>{{ $t('sidebar.navItems.logout') }}</span>
      </button>
    </template>

    <button v-else class="sidebar-auth-login" @click="authService.login">
      <IconSteam />
      <span>{{ $t('sidebar.navItems.login') }}</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-auth {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 24px;

  &-logout,
  &-profile,
  &-login {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 8px 10px;
    border-radius: 4px;
    color: #e0e0e0;
    font-family: 'Play', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    cursor: pointer;
    transition: all 0.2s ease;

    :deep(svg) {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }
  }

  &-logout {
    border: 1px solid rgba(85, 85, 85, 0.3);
    background: rgba(85, 85, 85, 0.1);

    &:hover {
      background: rgba(244, 67, 54, 0.12);
      border-color: rgba(244, 67, 54, 0.4);
      color: #f44336;
    }
  }

  &-profile {
    border: 1px solid rgba($accent, 0.2);
    background: rgba($accent, 0.05);
    text-decoration: none;

    &:hover {
      background: rgba($accent, 0.12);
      border-color: rgba($accent, 0.4);
    }
  }

  &-login {
    border: 1px solid rgba($accent, 0.2);
    background: rgba($accent, 0.05);

    :deep(svg) {
      width: 16px;
      height: 16px;
      color: #fff;
    }

    &:hover {
      background: rgba($accent, 0.12);
      border-color: rgba($accent, 0.4);
    }
  }
}

@media (max-width: $mobile) {
  .sidebar-auth {
    display: none;
  }
}
</style>
