<script setup lang="ts">
import { navigateTo } from 'nuxt/app';
import { type Ref, ref } from 'vue';

import type { AdminDto, AuthLoginDto } from '@backoffice/dtos';
import type { HttpResponse } from '@shared/types';

import type { AuthService } from '../composables/use-auth-service';

import { AppRoute } from '#layers/router';

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
});

const authService: AuthService = useAuthService();

const email: Ref<string> = ref('');
const password: Ref<string> = ref('');
const errorMessage: Ref<string | null> = ref(null);
const isLoading: Ref<boolean> = ref(false);

async function submit(): Promise<void> {
  errorMessage.value = null;
  isLoading.value = true;

  const dto: AuthLoginDto = {
    email: email.value,
    password: password.value,
  };

  const response: HttpResponse<AdminDto> = await authService.login(dto);

  isLoading.value = false;

  if (response.isSuccess) {
    await navigateTo(AppRoute.HOME);
  } else {
    errorMessage.value = response.error;
  }
}
</script>

<template>
  <Card class="auth-card">
    <template #title>
      <div class="auth-card__title">
        <i class="pi pi-shield" />
        <span>Backoffice</span>
      </div>
    </template>
    <template #content>
      <form class="auth-form" @submit.prevent="submit">
        <Message v-if="errorMessage" severity="error" :closable="false">
          {{ errorMessage }}
        </Message>

        <div class="auth-form__field">
          <label for="email">Email</label>
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
          <label for="password">Пароль</label>
          <Password
            input-id="password"
            v-model="password"
            :feedback="false"
            toggle-mask
            required
            fluid
          />
        </div>

        <Button type="submit" label="Войти" :loading="isLoading" fluid />
      </form>
    </template>
  </Card>
</template>

<style lang="scss" scoped>
.auth-card {
  width: 100%;
  max-width: 380px;

  &__title {
    display: flex;
    align-items: center;
    gap: 0.6rem;

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
}
</style>
