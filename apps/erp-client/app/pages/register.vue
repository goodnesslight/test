<script setup lang="ts">
import { navigateTo } from 'nuxt/app';
import { type Ref,ref } from 'vue';

import type { UserDto } from '@shared/dtos';
import type { HttpResponse } from '@shared/types';

import type { AuthService } from '../../layers/auth/composables/use-auth-service';

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
});

const { t } = useI18n();
const authService: AuthService = useAuthService();

const email: Ref<string> = ref('');
const username: Ref<string> = ref('');
const password: Ref<string> = ref('');
const errorMessage: Ref<string | null> = ref(null);
const isLoading: Ref<boolean> = ref(false);

async function submit(): Promise<void> {
  errorMessage.value = null;
  isLoading.value = true;

  const response: HttpResponse<UserDto> = await authService.register({
    email: email.value,
    username: username.value,
    password: password.value,
  });

  isLoading.value = false;

  if (response.isSuccess) {
    await navigateTo('/');
  } else {
    errorMessage.value = response.error;
  }
}

function loginWithGoogle(): void {
  window.location.href = authService.getGoogleLoginUrl();
}
</script>

<template>
  <Card class="auth-card">
    <template #title>
      <div class="auth-card__title">
        <i class="pi pi-th-large" />
        <span>{{ t('auth.registerTitle') }}</span>
      </div>
    </template>
    <template #content>
      <form class="auth-form" @submit.prevent="submit">
        <Message v-if="errorMessage" severity="error" :closable="false">
          {{ errorMessage }}
        </Message>

        <div class="auth-form__field">
          <label for="email">{{ t('auth.email') }}</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            fluid
          />
        </div>

        <div class="auth-form__field">
          <label for="username">{{ t('auth.username') }}</label>
          <InputText
            id="username"
            v-model="username"
            autocomplete="username"
            required
            fluid
          />
        </div>

        <div class="auth-form__field">
          <label for="password">{{ t('auth.password') }}</label>
          <Password
            id="password"
            v-model="password"
            toggle-mask
            autocomplete="new-password"
            required
            fluid
          />
        </div>

        <Button
          type="submit"
          :label="t('auth.register')"
          :loading="isLoading"
          fluid
        />

        <Divider align="center">
          <span class="auth-form__divider">{{ t('auth.or') }}</span>
        </Divider>

        <Button
          type="button"
          severity="secondary"
          outlined
          fluid
          @click="loginWithGoogle"
        >
          <i class="pi pi-google" />
          <span>{{ t('auth.google') }}</span>
        </Button>

        <div class="auth-form__footer">
          <span>{{ t('auth.haveAccount') }}</span>
          <NuxtLink to="/login">{{ t('auth.toLogin') }}</NuxtLink>
        </div>
      </form>
    </template>
  </Card>
</template>

<style lang="scss" scoped>
.auth-card {
  width: 100%;
  max-width: 400px;

  &__title {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .pi {
      color: $accent;
    }
  }
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    label {
      font-size: 0.9rem;
      color: $text-dim;
    }
  }

  &__divider {
    font-size: 0.8rem;
    color: $text-muted;
  }

  &__footer {
    display: flex;
    justify-content: center;
    gap: 0.4rem;
    font-size: 0.9rem;
    color: $text-dim;

    a {
      color: $accent;
      text-decoration: none;
    }
  }
}
</style>
