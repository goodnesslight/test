<script setup lang="ts">
import {
  computed,
  type ComputedRef,
  type Ref,
  ref,
  watch,
  type WritableComputedRef,
} from 'vue';

import type { EventCreateDto, EventDto, EventUpdateDto } from '@erp/dtos';
import { type HttpResponse } from '@shared/types';
import { EventScope, EventType } from '@erp/types';

import type { EventService } from '../composables/use-event-service';

import type { NotificationService } from '#layers/notification';

interface EventFormDialogProps {
  visible: boolean;
  teamId: number;
  event?: EventDto | null;
  initialStartsAt?: Date | null;
}

interface EventFormDialogEmits {
  (event: 'update:visible', value: boolean): void;
  (event: 'saved', saved: EventDto): void;
  (event: 'createTournament'): void;
}

interface EventTypeOption {
  label: string;
  value: string;
}

interface EventScopeOption {
  label: string;
  value: EventScope;
}

interface EventWeekdayOption {
  label: string;
  value: number;
}

const props: EventFormDialogProps = defineProps<EventFormDialogProps>();
const emit: EventFormDialogEmits = defineEmits<EventFormDialogEmits>();

const { t } = useI18n();
const eventService: EventService = useEventService();
const notificationService: NotificationService = useNotificationService();

const TOURNAMENT_LAUNCH: string = 'tournament';
const WEEKDAY_VALUES: number[] = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAY_KEYS: string[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
];

const type: Ref<EventType> = ref(EventType.PRACTICE);
const title: Ref<string> = ref('');
const opponent: Ref<string> = ref('');
const startsAt: Ref<Date | null> = ref(null);
const endsAt: Ref<Date | null> = ref(null);
const description: Ref<string> = ref('');
const isRepeating: Ref<boolean> = ref(false);
const repeatDays: Ref<number[]> = ref([]);
const repeatUntil: Ref<Date | null> = ref(null);
const scope: Ref<EventScope> = ref(EventScope.SINGLE);
const isLoading: Ref<boolean> = ref(false);

const typeOptions: ComputedRef<EventTypeOption[]> = computed(
  (): EventTypeOption[] => {
    const options: EventTypeOption[] = Object.values(EventType).map(
      (value: EventType): EventTypeOption => ({
        label: t(`events.types.${value}`),
        value,
      })
    );

    if (!isEdit.value) {
      options.push({
        label: t('events.tournamentOption'),
        value: TOURNAMENT_LAUNCH,
      });
    }

    return options;
  }
);
const weekdayOptions: ComputedRef<EventWeekdayOption[]> = computed(
  (): EventWeekdayOption[] =>
    WEEKDAY_KEYS.map(
      (key: string, index: number): EventWeekdayOption => ({
        label: t(`events.weekdays.${key}`),
        value: WEEKDAY_VALUES[index] as number,
      })
    )
);
const scopeOptions: ComputedRef<EventScopeOption[]> = computed(
  (): EventScopeOption[] => [
    { label: t('events.scopeSingle'), value: EventScope.SINGLE },
    { label: t('events.scopeSeries'), value: EventScope.SERIES },
  ]
);
const isEdit: ComputedRef<boolean> = computed((): boolean =>
  Boolean(props.event)
);
const isSeries: ComputedRef<boolean> = computed((): boolean =>
  Boolean(props.event?.seriesId)
);
const hasOpponent: ComputedRef<boolean> = computed(
  (): boolean => type.value !== EventType.PRACTICE
);
const isSubmitDisabled: ComputedRef<boolean> = computed(
  (): boolean =>
    !startsAt.value ||
    (isRepeating.value && (repeatDays.value.length === 0 || !repeatUntil.value))
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
      startsAt.value = props.event
        ? new Date(props.event.startsAt)
        : props.initialStartsAt ?? null;
      endsAt.value = props.event?.endsAt ? new Date(props.event.endsAt) : null;
      description.value = props.event?.description ?? '';
      isRepeating.value = false;
      repeatDays.value = [];
      repeatUntil.value = null;
      scope.value = EventScope.SINGLE;
    }
  }
);

function onTypeChange(value: string): void {
  if (value === TOURNAMENT_LAUNCH) {
    emit('createTournament');
    emit('update:visible', false);

    return;
  }

  type.value = value as EventType;
}

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
    ...(!props.event && isRepeating.value && repeatUntil.value
      ? {
          repeat: {
            daysOfWeek: repeatDays.value,
            until: repeatUntil.value.toISOString(),
          },
        }
      : {}),
  };
  const updateDto: EventUpdateDto = {
    ...dto,
    ...(isSeries.value ? { scope: scope.value } : {}),
  };

  const response: HttpResponse<EventDto> = props.event
    ? await eventService.update(props.event.id, updateDto)
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
          :model-value="type"
          :options="typeOptions"
          option-label="label"
          option-value="value"
          fluid
          @update:model-value="onTypeChange"
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

      <template v-if="!isEdit">
        <div class="event-form__repeat-toggle">
          <Checkbox v-model="isRepeating" input-id="event-repeat" binary />
          <label for="event-repeat">{{ t('events.repeat') }}</label>
        </div>

        <template v-if="isRepeating">
          <div class="event-form__field">
            <SelectButton
              v-model="repeatDays"
              :options="weekdayOptions"
              option-label="label"
              option-value="value"
              multiple
              size="small"
              :aria-label="t('events.repeat')"
            />
          </div>
          <div class="event-form__field">
            <label for="event-repeat-until">
              {{ t('events.repeatUntil') }}
            </label>
            <DatePicker
              id="event-repeat-until"
              v-model="repeatUntil"
              :min-date="startsAt ?? undefined"
              show-icon
              fluid
            />
          </div>
        </template>
      </template>

      <div v-if="isEdit && isSeries" class="event-form__field">
        <label for="event-scope">{{ t('events.applyTo') }}</label>
        <SelectButton
          id="event-scope"
          v-model="scope"
          :options="scopeOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          size="small"
        />
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
          :disabled="isSubmitDisabled"
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

  &__repeat-toggle {
    display: flex;
    align-items: center;
    gap: 0.6rem;

    label {
      font-size: 0.9rem;
      color: $text-secondary;
      cursor: pointer;
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
