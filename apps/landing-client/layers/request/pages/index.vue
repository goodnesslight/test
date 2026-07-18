<script setup lang="ts">
import { type Ref, ref } from 'vue';

import type { RequestCreateDto, RequestDto } from '@backoffice/dtos';
import type { HttpResponse } from '@shared/types';

import type { RequestService } from '../composables/use-request-service';

import type { NotificationService } from '#layers/notification';

const notificationService: NotificationService = useNotificationService();
const requestService: RequestService = useRequestService();

const name: Ref<string> = ref('');
const email: Ref<string> = ref('');
const organizationName: Ref<string> = ref('');
const message: Ref<string> = ref('');
const isLoading: Ref<boolean> = ref(false);
const isSent: Ref<boolean> = ref(false);

async function submit(): Promise<void> {
  isLoading.value = true;

  const dto: RequestCreateDto = {
    name: name.value,
    email: email.value,
    organizationName: organizationName.value,
    ...(message.value ? { message: message.value } : {}),
  };

  const response: HttpResponse<RequestDto> = await requestService.submit(dto);

  isLoading.value = false;

  if (response.isSuccess) {
    isSent.value = true;
    notificationService.showSuccess(
      'Заявка отправлена',
      'Мы свяжемся с вами по указанной почте.'
    );
  } else {
    notificationService.showError(response.error);
  }
}

function reset(): void {
  name.value = '';
  email.value = '';
  organizationName.value = '';
  message.value = '';
  isSent.value = false;
}
</script>

<template>
  <div class="landing">
    <section class="landing__hero">
      <span class="landing__badge">
        <i class="pi pi-bolt" />
        Демо-платформа для киберспортивных организаций
      </span>
      <h1 class="landing__title">
        Запустите свою организацию<br />за пару минут
      </h1>
      <p class="landing__lead">
        Команды, расписание тренировок, матчи и приглашения игроков — всё в
        одном месте. Оставьте заявку на демо, и мы развернём организацию для
        вас.
      </p>
    </section>

    <Card class="landing__card">
      <template #content>
        <div v-if="isSent" class="landing__done">
          <i class="pi pi-check-circle" />
          <h2>Спасибо за заявку!</h2>
          <p>Мы получили её и свяжемся с вами по адресу {{ email }}.</p>
          <Button
            label="Оставить ещё одну"
            severity="secondary"
            outlined
            @click="reset"
          />
        </div>

        <form v-else class="request-form" @submit.prevent="submit">
          <h2 class="request-form__title">Заявка на демо-организацию</h2>

          <div class="request-form__field">
            <label for="name">Ваше имя</label>
            <InputText id="name" v-model="name" required fluid />
          </div>

          <div class="request-form__field">
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

          <div class="request-form__field">
            <label for="org">Название организации</label>
            <InputText
              id="org"
              v-model="organizationName"
              maxlength="48"
              required
              fluid
            />
          </div>

          <div class="request-form__field">
            <label for="message">Комментарий (необязательно)</label>
            <Textarea
              id="message"
              v-model="message"
              rows="3"
              maxlength="500"
              auto-resize
              fluid
            />
          </div>

          <Button
            type="submit"
            label="Отправить заявку"
            icon="pi pi-send"
            :loading="isLoading"
            fluid
          />
        </form>
      </template>
    </Card>
  </div>
</template>

<style lang="scss" scoped>
.landing {
  max-width: 960px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 3rem;
  align-items: center;

  &__hero {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    align-self: flex-start;
    padding: 0.4rem 0.85rem;
    border-radius: 999px;
    background: $accent-soft;
    border: 1px solid $accent-border;
    color: $text-secondary;
    font-size: 0.82rem;

    .pi {
      color: $accent;
    }
  }

  &__title {
    font-size: 2.4rem;
    line-height: 1.1;
  }

  &__lead {
    color: $text-dim;
    font-size: 1.05rem;
    line-height: 1.6;
  }

  &__card {
    width: 100%;
  }

  &__done {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 0.5rem;
    text-align: center;

    .pi {
      font-size: 2.6rem;
      color: $color-win;
    }

    p {
      color: $text-dim;
    }
  }

  @media (max-width: $mobile) {
    grid-template-columns: 1fr;
    padding: 2rem 1rem;
    gap: 2rem;

    &__title {
      font-size: 1.9rem;
    }
  }
}

.request-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__title {
    font-size: 1.2rem;
    margin-bottom: 0.25rem;
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
}
</style>
