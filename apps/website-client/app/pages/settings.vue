<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { computed, type ComputedRef, type Ref, ref, watch } from 'vue';

import type { UserDto } from '@shared/dtos';
import { type HttpResponse, Locale } from '@shared/types';

import type { AuthService } from '../../layers/auth/composables/use-auth-service';
import type { UserService } from '../../layers/auth/composables/use-user-service';
import type { LocaleService } from '../../layers/i18n/composables/use-locale-service';

definePageMeta({
  middleware: 'auth',
});

interface LocaleOption {
  label: string;
  value: Locale;
}

const { t } = useI18n();
const toast: ReturnType<typeof useToast> = useToast();
const authService: AuthService = useAuthService();
const userService: UserService = useUserService();
const localeService: LocaleService = useLocaleService();

const user: ComputedRef<UserDto | null> = computed(
  (): UserDto | null => authService.user.value
);

const firstName: Ref<string> = ref('');
const lastName: Ref<string> = ref('');
const locale: Ref<Locale> = ref(Locale.RU);
const isSaving: Ref<boolean> = ref(false);

const localeOptions: ComputedRef<LocaleOption[]> = computed(
  (): LocaleOption[] => [
    { label: t('settings.languages.ru'), value: Locale.RU },
    { label: t('settings.languages.en'), value: Locale.EN },
  ]
);

watch(
  user,
  (value: UserDto | null): void => {
    if (value) {
      firstName.value = value.firstName ?? '';
      lastName.value = value.lastName ?? '';
      locale.value = value.locale;
    }
  },
  { immediate: true }
);

async function save(): Promise<void> {
  isSaving.value = true;

  const response: HttpResponse<UserDto> = await userService.updateProfile({
    firstName: firstName.value,
    lastName: lastName.value,
    locale: locale.value,
  });

  isSaving.value = false;

  if (response.isSuccess) {
    localeService.apply(response.data.locale);
    toast.add({
      severity: 'success',
      summary: t('settings.saved'),
      life: 3000,
    });
  } else {
    showError(response.error);
  }
}

function showError(message: string): void {
  toast.add({
    severity: 'error',
    summary: t('common.error'),
    detail: message,
    life: 5000,
  });
}
</script>

<template>
  <div class="settings-page">
    <h1>{{ t('settings.title') }}</h1>

    <Card v-if="user" class="settings-page__card">
      <template #title>{{ t('settings.profile') }}</template>
      <template #content>
        <div class="settings-form">
          <div class="settings-form__row">
            <div class="settings-form__field">
              <label for="settings-first-name">
                {{ t('settings.firstName') }}
              </label>
              <InputText
                id="settings-first-name"
                v-model="firstName"
                maxlength="64"
                fluid
              />
            </div>
            <div class="settings-form__field">
              <label for="settings-last-name">
                {{ t('settings.lastName') }}
              </label>
              <InputText
                id="settings-last-name"
                v-model="lastName"
                maxlength="64"
                fluid
              />
            </div>
          </div>

          <div class="settings-form__row">
            <div class="settings-form__field">
              <label for="settings-language">
                {{ t('settings.language') }}
              </label>
              <Select
                id="settings-language"
                v-model="locale"
                :options="localeOptions"
                option-label="label"
                option-value="value"
                fluid
              />
            </div>
            <div class="settings-form__field">
              <label>{{ t('auth.username') }}</label>
              <InputText :model-value="user.username" disabled fluid />
            </div>
          </div>

          <div class="settings-form__actions">
            <Button
              :label="t('common.save')"
              icon="pi pi-check"
              :loading="isSaving"
              @click="save"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style lang="scss" scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  h1 {
    font-size: 1.5rem;
  }

  &__card {
    max-width: 640px;
  }
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;

    @media (max-width: $mobile) {
      grid-template-columns: 1fr;
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    label {
      font-size: 0.9rem;
      color: $text-dim;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
