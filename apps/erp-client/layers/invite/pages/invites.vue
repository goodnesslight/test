<script setup lang="ts">
import { onMounted, type Ref, ref } from 'vue';

import type { InviteDto } from '@shared/dtos';
import type { HttpResponse } from '@shared/types';

import type { InviteService } from '../composables/use-invite-service';

import type { NotificationService } from '#layers/notification';

definePageMeta({
  middleware: 'auth',
});

const { t } = useI18n();
const inviteService: InviteService = useInviteService();
const notificationService: NotificationService = useNotificationService();

const invites: Ref<InviteDto[]> = ref([]);
const isLoading: Ref<boolean> = ref(true);

async function loadInvites(): Promise<void> {
  isLoading.value = true;

  const response: HttpResponse<InviteDto[]> =
    await inviteService.getMyPending();

  if (response.isSuccess) {
    invites.value = response.data;
  }

  isLoading.value = false;
}

async function accept(invite: InviteDto): Promise<void> {
  const response: HttpResponse<null> = await inviteService.accept(invite.id);

  if (response.isSuccess) {
    notificationService.showSuccess(
      t('invites.acceptedToast', { team: getTeamName(invite) })
    );
    await loadInvites();
  } else {
    notificationService.showError(response.error);
  }
}

async function decline(invite: InviteDto): Promise<void> {
  const response: HttpResponse<null> = await inviteService.decline(invite.id);

  if (response.isSuccess) {
    await loadInvites();
  } else {
    notificationService.showError(response.error);
  }
}

function getTeamName(invite: InviteDto): string {
  if (!invite.team) {
    return '';
  }

  const typeLabel: string = t(`teams.types.${invite.team.type}`);

  return invite.team.game
    ? `${getGameLabel(invite.team.game.type)} — ${typeLabel}`
    : typeLabel;
}

onMounted(loadInvites);
</script>

<template>
  <div class="invites-page">
    <h1>{{ t('invites.title') }}</h1>

    <div v-if="isLoading" class="invites-page__skeletons">
      <Skeleton height="5rem" />
      <Skeleton height="5rem" />
    </div>

    <Card v-else-if="invites.length === 0">
      <template #content>
        <div class="invites-page__empty">
          <i class="pi pi-inbox" />
          <p>{{ t('invites.empty') }}</p>
        </div>
      </template>
    </Card>

    <div v-else class="invites-page__list">
      <Card v-for="invite in invites" :key="invite.id">
        <template #content>
          <div class="invite-row">
            <Avatar
              :image="invite.team?.game?.organization?.logoUrl ?? undefined"
              :label="
                invite.team?.game?.organization?.logoUrl
                  ? undefined
                  : invite.team?.game?.organization?.name[0]?.toUpperCase()
              "
              size="large"
              shape="circle"
            />
            <div class="invite-row__info">
              <span class="invite-row__title">
                {{ invite.team?.game?.organization?.name }}
                <Tag
                  v-if="invite.team?.game?.organization"
                  :value="invite.team.game.organization.tag"
                  severity="secondary"
                />
              </span>
              <span class="invite-row__subtitle">
                {{ t('invites.invitedYou', { team: getTeamName(invite) }) }}
                · {{ t(`teams.roles.${invite.role}`) }}
              </span>
            </div>
            <div class="invite-row__actions">
              <Button
                :label="t('invites.accept')"
                icon="pi pi-check"
                size="small"
                @click="accept(invite)"
              />
              <Button
                :label="t('invites.decline')"
                icon="pi pi-times"
                severity="secondary"
                outlined
                size="small"
                @click="decline(invite)"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.invites-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  h1 {
    font-size: 1.5rem;
  }

  &__skeletons,
  &__list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 2rem;
    color: $text-dim;

    .pi {
      font-size: 2rem;
      color: $text-muted;
    }
  }
}

.invite-row {
  display: flex;
  align-items: center;
  gap: 1rem;

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    min-width: 0;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }

  &__subtitle {
    color: $text-dim;
    font-size: 0.9rem;
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
  }

  @media (max-width: $mobile) {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
