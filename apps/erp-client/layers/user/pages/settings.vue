<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import {
  computed,
  type ComputedRef,
  onMounted,
  type Ref,
  ref,
  watch,
} from 'vue';

import type {
  UserCalendarTokenDto,
  UserDto,
  UserUpdateProfileDto,
} from '@erp/dtos';
import { type HttpResponse } from '@shared/types';
import { Locale } from '@erp/types';

import type { UserService } from '../composables/use-user-service';

import type { AuthService } from '#layers/auth';
import type { EventService } from '#layers/event';
import type { LocaleService } from '#layers/i18n';
import type { NotificationService } from '#layers/notification';

definePageMeta({
  middleware: 'auth',
});

interface UserLocaleOption {
  label: string;
  value: Locale;
}

const { t } = useI18n();
const confirm: ReturnType<typeof useConfirm> = useConfirm();
const authService: AuthService = useAuthService();
const eventService: EventService = useEventService();
const localeService: LocaleService = useLocaleService();
const notificationService: NotificationService = useNotificationService();
const userService: UserService = useUserService();

const firstName: Ref<string> = ref('');
const lastName: Ref<string> = ref('');
const locale: Ref<Locale> = ref(Locale.RU);
const isSaving: Ref<boolean> = ref(false);
const calendarFeedUrl: Ref<string> = ref('');

const user: ComputedRef<UserDto | null> = computed(
  (): UserDto | null => authService.user.value
);
const localeOptions: ComputedRef<UserLocaleOption[]> = computed(
  (): UserLocaleOption[] => [
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

async function loadCalendarFeedUrl(): Promise<void> {
  const response: HttpResponse<UserCalendarTokenDto> =
    await userService.getCalendarToken();

  if (response.isSuccess) {
    calendarFeedUrl.value = eventService.getFeedUrl(
      response.data.calendarToken
    );
  } else {
    notificationService.showError(response.error);
  }
}

async function save(): Promise<void> {
  isSaving.value = true;

  const dto: UserUpdateProfileDto = {
    firstName: firstName.value,
    lastName: lastName.value,
    locale: locale.value,
  };

  const response: HttpResponse<UserDto> = await userService.updateProfile(dto);

  isSaving.value = false;

  if (response.isSuccess) {
    localeService.apply(response.data.locale);
    notificationService.showSuccess(t('settings.saved'));
  } else {
    notificationService.showError(response.error);
  }
}

async function copyCalendarFeedUrl(): Promise<void> {
  await navigator.clipboard.writeText(calendarFeedUrl.value);
  notificationService.showSuccess(t('settings.calendar.copied'));
}

function confirmRegenerateCalendarFeedUrl(): void {
  confirm.require({
    header: t('settings.calendar.regenerateHeader'),
    message: t('settings.calendar.regenerateConfirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptProps: { label: t('settings.calendar.regenerate') },
    rejectProps: {
      label: t('common.cancel'),
      severity: 'secondary',
      text: true,
    },
    accept: async (): Promise<void> => {
      const response: HttpResponse<UserCalendarTokenDto> =
        await userService.regenerateCalendarToken();

      if (response.isSuccess) {
        calendarFeedUrl.value = eventService.getFeedUrl(
          response.data.calendarToken
        );
        notificationService.showSuccess(t('settings.calendar.regenerated'));
      } else {
        notificationService.showError(response.error);
      }
    },
  });
}

onMounted(loadCalendarFeedUrl);
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
              <label>{{ t('auth.email') }}</label>
              <InputText :model-value="user.email ?? ''" disabled fluid />
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

    <Card class="settings-page__card">
      <template #title>{{ t('settings.calendar.title') }}</template>
      <template #content>
        <div class="settings-calendar">
          <p class="settings-calendar__description">
            {{ t('settings.calendar.description') }}
          </p>
          <div class="settings-calendar__link">
            <InputText :model-value="calendarFeedUrl" readonly fluid />
            <Button
              :label="t('settings.calendar.copy')"
              icon="pi pi-copy"
              :disabled="!calendarFeedUrl"
              @click="copyCalendarFeedUrl"
            />
            <Button
              :label="t('settings.calendar.regenerate')"
              icon="pi pi-refresh"
              severity="secondary"
              outlined
              :disabled="!calendarFeedUrl"
              @click="confirmRegenerateCalendarFeedUrl"
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

.settings-calendar {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__description {
    color: $text-dim;
    font-size: 0.9rem;
  }

  &__link {
    display: flex;
    gap: 0.75rem;

    @media (max-width: $mobile) {
      flex-direction: column;
    }
  }
}
</style>
