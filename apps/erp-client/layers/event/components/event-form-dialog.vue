<script setup lang="ts">
import {
  computed,
  type ComputedRef,
  type Ref,
  ref,
  watch,
  type WritableComputedRef,
} from 'vue';

import type { EventCreateDto, EventDto } from '@shared/dtos';
import { EventType, type HttpResponse } from '@shared/types';

import type { EventService } from '../composables/use-event-service';

import type { NotificationService } from '#layers/notification';

interface EventFormDialogProps {
  visible: boolean;
  teamId: number;
  event?: EventDto | null;
}

interface EventFormDialogEmits {
  (event: 'update:visible', value: boolean): void;
  (event: 'saved', saved: EventDto): void;
}

interface EventTypeOption {
  label: string;
  value: EventType;
}

const props: EventFormDialogProps = defineProps<EventFormDialogProps>();
const emit: EventFormDialogEmits = defineEmits<EventFormDialogEmits>();

const { t } = useI18n();
const eventService: EventService = useEventService();
const notificationService: NotificationService = useNotificationService();

const type: Ref<EventType> = ref(EventType.PRACTICE);
const title: Ref<string> = ref('');
const opponent: Ref<string> = ref('');
const startsAt: Ref<Date | null> = ref(null);
const endsAt: Ref<Date | null> = ref(null);
const description: Ref<string> = ref('');
const isLoading: Ref<boolean> = ref(false);

const typeOptions: ComputedRef<EventTypeOption[]> = computed(
  (): EventTypeOption[] =>
    Object.values(EventType).map(
      (value: EventType): EventTypeOption => ({
        label: t(`events.types.${value}`),
        value,
      })
    )
);
const isEdit: ComputedRef<boolean> = computed(
  (): boolean => Boolean(props.event)
);
const hasOpponent: ComputedRef<boolean> = computed(
  (): boolean => type.value !== EventType.PRACTICE
);
const isVisible: WritableComputedRef<boolean> = computed({
  get: (): boolean => props.visible,
  set: (value: boolean): void => emit('update:visible', value),
});

watch(
  (): boolean => props.visible,
  (visible: boolean): void => {
    if (visible) {
      type.value = props.event?.type ?? EventType.PRACTICE;
      title.value = props.event?.title ?? '';
      opponent.value = props.event?.opponent ?? '';
      startsAt.value = props.event ? new Date(props.event.startsAt) : null;
      endsAt.value = props.event?.endsAt
        ? new Date(props.event.endsAt)
        : null;
      description.value = props.event?.description ?? '';
    }
  }
);

async function submit(): Promise<void> {
  if (!startsAt.value) {
    return;
  }

  isLoading.value = true;

  const dto: EventCreateDto = {
    type: type.value,
    title: title.value,
    startsAt: startsAt.value.toISOString(),
    ...(hasOpponent.value && opponent.value
      ? { opponent: opponent.value }
      : {}),
    ...(endsAt.value ? { endsAt: endsAt.value.toISOString() } : {}),
    ...(description.value ? { description: description.value } : {}),
  };

  const response: HttpResponse<EventDto> = props.event
    ? await eventService.update(props.event.id, dto)
    : await eventService.create(props.teamId, dto);

  isLoading.value = false;

  if (response.isSuccess) {
    emit('saved', response.data);
    emit('update:visible', false);
  } else {
    notificationService.showError(response.error);
  }
}
</script>

<template>
  <Dialog
    v-model:visible="isVisible"
    :header="isEdit ? t('events.edit') : t('events.create')"
    modal
    :style="{ width: '460px' }"
  >
    <form class="event-form" @submit.prevent="submit">
      <div class="event-form__field">
        <label for="event-type">{{ t('events.type') }}</label>
        <Select
          id="event-type"
          v-model="type"
          :options="typeOptions"
          option-label="label"
          option-value="value"
          fluid
        />
      </div>

      <div class="event-form__field">
        <label for="event-title">{{ t('events.eventTitle') }}</label>
        <InputText id="event-title" v-model="title" required fluid />
      </div>

      <div v-if="hasOpponent" class="event-form__field">
        <label for="event-opponent">{{ t('events.opponent') }}</label>
        <InputText id="event-opponent" v-model="opponent" fluid />
      </div>

      <div class="event-form__row">
        <div class="event-form__field">
          <label for="event-starts">{{ t('events.startsAt') }}</label>
          <DatePicker
            id="event-starts"
            v-model="startsAt"
            show-time
            hour-format="24"
            show-icon
            fluid
          />
        </div>
        <div class="event-form__field">
          <label for="event-ends">{{ t('events.endsAt') }}</label>
          <DatePicker
            id="event-ends"
            v-model="endsAt"
            show-time
            hour-format="24"
            show-icon
            fluid
          />
        </div>
      </div>

      <div class="event-form__field">
        <label for="event-description">{{ t('events.description') }}</label>
        <Textarea
          id="event-description"
          v-model="description"
          rows="3"
          auto-resize
          fluid
        />
      </div>

      <div class="event-form__actions">
        <Button
          type="button"
          :label="t('common.cancel')"
          severity="secondary"
          text
          @click="isVisible = false"
        />
        <Button
          type="submit"
          :label="t('common.save')"
          :loading="isLoading"
          :disabled="!startsAt"
        />
      </div>
    </form>
  </Dialog>
</template>

<style lang="scss" scoped>
.event-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
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
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
}
</style>
