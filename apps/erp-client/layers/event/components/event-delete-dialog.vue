<script setup lang="ts">
import {
  computed,
  type ComputedRef,
  type Ref,
  ref,
  watch,
  type WritableComputedRef,
} from 'vue';

import type { EventDto } from '@shared/dtos';
import { EventScope } from '@shared/types';

interface EventDeleteDialogProps {
  visible: boolean;
  event: EventDto | null;
}

interface EventDeleteDialogEmits {
  (event: 'update:visible', value: boolean): void;
  (event: 'remove', value: EventScope): void;
}

interface EventScopeOption {
  label: string;
  value: EventScope;
}

const props: EventDeleteDialogProps = defineProps<EventDeleteDialogProps>();
const emit: EventDeleteDialogEmits = defineEmits<EventDeleteDialogEmits>();

const { t } = useI18n();

const scope: Ref<EventScope> = ref(EventScope.SINGLE);

const scopeOptions: ComputedRef<EventScopeOption[]> = computed(
  (): EventScopeOption[] => [
    { label: t('events.scopeSingle'), value: EventScope.SINGLE },
    { label: t('events.scopeSeries'), value: EventScope.SERIES },
  ]
);
const isSeries: ComputedRef<boolean> = computed((): boolean =>
  Boolean(props.event?.seriesId)
);
const isVisible: WritableComputedRef<boolean> = computed({
  get: (): boolean => props.visible,
  set: (value: boolean): void => emit('update:visible', value),
});

watch(
  (): boolean => props.visible,
  (visible: boolean): void => {
    if (visible) {
      scope.value = EventScope.SINGLE;
    }
  }
);

function remove(): void {
  emit('remove', scope.value);
  emit('update:visible', false);
}
</script>

<template>
  <Dialog
    v-model:visible="isVisible"
    :header="t('events.deleteHeader')"
    modal
    :style="{ width: '400px' }"
  >
    <div v-if="event" class="event-delete">
      <p class="event-delete__message">
        {{ t('events.deleteConfirm', { title: event.title }) }}
      </p>

      <div v-if="isSeries" class="event-delete__scopes">
        <div
          v-for="option in scopeOptions"
          :key="option.value"
          class="event-delete__scope"
        >
          <RadioButton
            v-model="scope"
            :input-id="`event-delete-scope-${option.value}`"
            :value="option.value"
          />
          <label :for="`event-delete-scope-${option.value}`">
            {{ option.label }}
          </label>
        </div>
      </div>

      <div class="event-delete__actions">
        <Button
          :label="t('common.cancel')"
          severity="secondary"
          text
          @click="isVisible = false"
        />
        <Button
          :label="t('common.delete')"
          icon="pi pi-trash"
          severity="danger"
          @click="remove"
        />
      </div>
    </div>
  </Dialog>
</template>

<style lang="scss" scoped>
.event-delete {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__message {
    color: $text-secondary;
  }

  &__scopes {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__scope {
    display: flex;
    align-items: center;
    gap: 0.6rem;

    label {
      color: $text-secondary;
      font-size: 0.92rem;
      cursor: pointer;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }
}
</style>
