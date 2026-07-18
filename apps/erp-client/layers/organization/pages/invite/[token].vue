<script setup lang="ts">
import { navigateTo, useRoute } from 'nuxt/app';
import { computed, type ComputedRef, onMounted, type Ref, ref } from 'vue';

import type {
  AuthRegisterDto,
  OrganizationInviteDto,
  UserDto,
} from '@erp/dtos';
import type { HttpResponse } from '@shared/types';

import type { OrganizationService } from '../../composables/use-organization-service';

import type { AuthService } from '#layers/auth';
import { AppRoute } from '#layers/router';

definePageMeta({
  layout: 'auth',
});

const { t } = useI18n();
const route: ReturnType<typeof useRoute> = useRoute();
const authService: AuthService = useAuthService();
const organizationService: OrganizationService = useOrganizationService();

const token: string = String(route.params.token);
const invite: Ref<OrganizationInviteDto | null> = ref(null);
const password: Ref<string> = ref('');
const errorMessage: Ref<string | null> = ref(null);
const isLoading: Ref<boolean> = ref(true);
const isSubmitting: Ref<boolean> = ref(false);

const isAuthenticated: ComputedRef<boolean> = computed(
  (): boolean => authService.isAuthenticated.value
);
const emailMatches: ComputedRef<boolean> = computed(
  (): boolean =>
    authService.user.value?.email?.toLowerCase() ===
    invite.value?.email.toLowerCase()
);
const fullName: ComputedRef<string> = computed((): string =>
  [invite.value?.firstName, invite.value?.lastName].filter(Boolean).join(' ')
);

async function loadInvite(): Promise<void> {
  isLoading.value = true;

  const response: HttpResponse<OrganizationInviteDto> =
    await organizationService.getInviteByToken(token);

  if (response.isSuccess) {
    invite.value = response.data;
  } else {
    errorMessage.value = response.error;
  }

  isLoading.value = false;
}

async function register(): Promise<void> {
  errorMessage.value = null;
  isSubmitting.value = true;

  const dto: AuthRegisterDto = {
    inviteToken: token,
    password: password.value,
  };

  const response: HttpResponse<UserDto> = await authService.register(dto);

  isSubmitting.value = false;

  if (response.isSuccess) {
    await navigateTo(AppRoute.HOME);
  } else {
    errorMessage.value = response.error;
  }
}

async function join(): Promise<void> {
  errorMessage.value = null;
  isSubmitting.value = true;

  const response: HttpResponse<OrganizationInviteDto> =
    await organizationService.acceptInvite(token);

  isSubmitting.value = false;

  if (response.isSuccess) {
    await navigateTo(AppRoute.HOME);
  } else {
    errorMessage.value = response.error;
  }
}

async function logoutAndRetry(): Promise<void> {
  errorMessage.value = null;
  await authService.logout();
}

onMounted(async (): Promise<void> => {
  await authService.fetchMe();
  await loadInvite();
});
</script>

<template>
  <Card class="auth-card">
    <template #title>
      <div class="auth-card__title">
        <i class="pi pi-envelope" />
        <span>{{ t('invite.title') }}</span>
      </div>
    </template>
    <template #content>
      <div v-if="isLoading" class="auth-card__loading">
        <ProgressSpinner />
      </div>

      <Message v-else-if="!invite" severity="error" :closable="false">
        {{ errorMessage ?? t('invite.invalid') }}
      </Message>

      <div v-else class="invite">
        <p class="invite__lead">
          {{
            t('invite.lead', { organization: invite.organization?.name ?? '' })
          }}
        </p>

        <dl class="invite__details">
          <div v-if="fullName" class="invite__row">
            <dt>{{ t('invite.fullName') }}</dt>
            <dd>{{ fullName }}</dd>
          </div>
          <div class="invite__row">
            <dt>{{ t('auth.email') }}</dt>
            <dd>{{ invite.email }}</dd>
          </div>
          <div v-if="invite.country" class="invite__row">
            <dt>{{ t('organizations.invites.country') }}</dt>
            <dd>{{ invite.country }}</dd>
          </div>
          <div v-if="invite.birthDate" class="invite__row">
            <dt>{{ t('organizations.invites.birthDate') }}</dt>
            <dd>{{ invite.birthDate }}</dd>
          </div>
        </dl>

        <Message v-if="errorMessage" severity="error" :closable="false">
          {{ errorMessage }}
        </Message>

        <form
          v-if="!isAuthenticated"
          class="auth-form"
          @submit.prevent="register"
        >
          <div class="auth-form__field">
            <label for="password">{{ t('invite.setPassword') }}</label>
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
            :label="t('invite.register')"
            :loading="isSubmitting"
            fluid
          />
        </form>

        <Button
          v-else-if="emailMatches"
          type="button"
          :label="t('invite.join')"
          icon="pi pi-check"
          :loading="isSubmitting"
          fluid
          @click="join"
        />

        <div v-else class="invite__wrong">
          <Message severity="warn" :closable="false">
            {{ t('invite.wrongAccount', { email: invite.email }) }}
          </Message>
          <Button
            type="button"
            :label="t('invite.logout')"
            icon="pi pi-sign-out"
            severity="secondary"
            outlined
            fluid
            @click="logoutAndRetry"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<style lang="scss" scoped>
.auth-card {
  width: 100%;
  max-width: 420px;

  &__title {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .pi {
      color: $accent;
    }
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: 1.5rem;
  }
}

.invite {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__lead {
    font-size: 1rem;
    color: $text-primary;
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0;
    padding: 0.85rem 1rem;
    background: $bg-card-alt;
    border: 1px solid $border;
    border-radius: 12px;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.9rem;

    dt {
      color: $text-dim;
    }

    dd {
      margin: 0;
      color: $text-primary;
      font-weight: 500;
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
