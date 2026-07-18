<script setup lang="ts">
import { onMounted, type Ref, ref, watch } from 'vue';

import type { RequestNoteCreateDto, RequestNoteDto } from '@backoffice/dtos';
import type { HttpResponse } from '@shared/types';

import type { RequestService } from '../composables/use-request-service';

import type { NotificationService } from '#layers/notification';

interface RequestNotesProps {
  requestId: number;
  disabled?: boolean;
}

const props: RequestNotesProps = defineProps<RequestNotesProps>();

const notificationService: NotificationService = useNotificationService();
const requestService: RequestService = useRequestService();

const notes: Ref<RequestNoteDto[]> = ref([]);
const draft: Ref<string> = ref('');
const isLoading: Ref<boolean> = ref(true);
const isSending: Ref<boolean> = ref(false);

async function loadNotes(): Promise<void> {
  isLoading.value = true;

  const response: HttpResponse<RequestNoteDto[]> =
    await requestService.getNotes(props.requestId);

  if (response.isSuccess) {
    notes.value = response.data;
  } else {
    notificationService.showError(response.error);
  }

  isLoading.value = false;
}

async function sendNote(): Promise<void> {
  const text: string = draft.value.trim();

  if (!text || isSending.value) {
    return;
  }

  isSending.value = true;

  const dto: RequestNoteCreateDto = { text };
  const response: HttpResponse<RequestNoteDto> =
    await requestService.createNote(props.requestId, dto);

  isSending.value = false;

  if (response.isSuccess) {
    notes.value = [...notes.value, response.data];
    draft.value = '';
  } else {
    notificationService.showError(response.error);
  }
}

function formatDate(value: Date): string {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

watch(
  (): number => props.requestId,
  async (): Promise<void> => {
    await loadNotes();
  }
);

onMounted(async (): Promise<void> => {
  await loadNotes();
});
</script>

<template>
  <div class="request-notes">
    <h2 class="request-notes__title">
      <i class="pi pi-comments" /> Заметки
    </h2>

    <ProgressSpinner v-if="isLoading" class="request-notes__spinner" />

    <template v-else>
      <div v-if="notes.length === 0" class="request-notes__empty">
        Пока нет заметок. Оставьте первую — она видна только вам.
      </div>

      <ul v-else class="request-notes__list">
        <li v-for="note in notes" :key="note.id" class="note">
          <p class="note__text">{{ note.text }}</p>
          <span class="note__date">{{ formatDate(note.createdAt) }}</span>
        </li>
      </ul>

      <form
        v-if="!disabled"
        class="request-notes__composer"
        @submit.prevent="sendNote"
      >
        <Textarea
          v-model="draft"
          rows="2"
          auto-resize
          placeholder="Заметка для себя…"
          fluid
        />
        <Button
          type="submit"
          icon="pi pi-send"
          label="Добавить"
          size="small"
          :loading="isSending"
          :disabled="draft.trim().length === 0"
        />
      </form>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.request-notes {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;

    .pi {
      color: $accent;
    }
  }

  &__spinner {
    align-self: center;
  }

  &__empty {
    color: $text-dim;
    font-size: 0.9rem;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__composer {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    align-items: flex-end;
  }
}

.note {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.7rem 0.9rem;
  background: $bg-card-alt;
  border: 1px solid $border;
  border-radius: 12px;

  &__text {
    margin: 0;
    color: $text-primary;
    font-size: 0.92rem;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__date {
    align-self: flex-end;
    color: $text-muted;
    font-size: 0.75rem;
  }
}
</style>
