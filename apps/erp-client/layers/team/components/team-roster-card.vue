<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import { computed, type ComputedRef, onMounted, type Ref, ref } from 'vue';

import type {
  InviteDto,
  TeamDto,
  TeamMemberDto,
  TeamUpdateMemberDto,
} from '@shared/dtos';
import { type HttpResponse, TeamMemberRole } from '@shared/types';

import type { TeamRoleOption } from '../composables/use-team-role-options';
import type { TeamService } from '../composables/use-team-service';

import type { AuthService } from '#layers/auth';
import type { DateService } from '#layers/date';
import type { InviteService } from '#layers/invite';
import type { NotificationService } from '#layers/notification';

interface TeamRosterCardProps {
  team: TeamDto;
  isOwner: boolean;
}

interface TeamRosterCardEmits {
  (event: 'updated', team: TeamDto): void;
}

const props: TeamRosterCardProps = defineProps<TeamRosterCardProps>();
const emit: TeamRosterCardEmits = defineEmits<TeamRosterCardEmits>();

const { t } = useI18n();
const confirm: ReturnType<typeof useConfirm> = useConfirm();
const authService: AuthService = useAuthService();
const dateService: DateService = useDateService();
const inviteService: InviteService = useInviteService();
const notificationService: NotificationService = useNotificationService();
const teamService: TeamService = useTeamService();
const roleOptions: ComputedRef<TeamRoleOption[]> = useTeamRoleOptions();

const ROLE_SEVERITIES: Record<TeamMemberRole, string> = {
  [TeamMemberRole.COACH]: 'warn',
  [TeamMemberRole.CAPTAIN]: 'info',
  [TeamMemberRole.PLAYER]: 'success',
  [TeamMemberRole.SUBSTITUTE]: 'secondary',
};

const pendingInvites: Ref<InviteDto[]> = ref([]);
const isInviteDialogVisible: Ref<boolean> = ref(false);

const currentUserId: ComputedRef<number | null> = computed(
  (): number | null => authService.user.value?.id ?? null
);

async function loadPendingInvites(): Promise<void> {
  if (!props.isOwner) {
    return;
  }

  const response: HttpResponse<InviteDto[]> =
    await inviteService.getPendingForTeam(props.team.id);

  if (response.isSuccess) {
    pendingInvites.value = response.data;
  }
}

async function changeRole(
  member: TeamMemberDto,
  role: TeamMemberRole
): Promise<void> {
  const dto: TeamUpdateMemberDto = { role };

  const response: HttpResponse<TeamDto> = await teamService.updateMemberRole(
    props.team.id,
    member.id,
    dto
  );

  if (response.isSuccess) {
    emit('updated', response.data);
  } else {
    notificationService.showError(response.error);
  }
}

function confirmRemove(member: TeamMemberDto): void {
  const isSelf: boolean = member.user?.id === currentUserId.value;

  confirm.require({
    header: isSelf ? t('invites.leaveHeader') : t('invites.kickHeader'),
    message: isSelf
      ? t('invites.leaveConfirm')
      : t('invites.kickConfirm', { username: member.user?.username ?? '' }),
    icon: 'pi pi-exclamation-triangle',
    acceptProps: {
      label: isSelf ? t('invites.leave') : t('invites.kick'),
      severity: 'danger',
    },
    rejectProps: {
      label: t('common.cancel'),
      severity: 'secondary',
      text: true,
    },
    accept: async (): Promise<void> => {
      const response: HttpResponse<TeamDto> = await teamService.removeMember(
        props.team.id,
        member.id
      );

      if (response.isSuccess) {
        emit('updated', response.data);
      } else {
        notificationService.showError(response.error);
      }
    },
  });
}

async function revokeInvite(invite: InviteDto): Promise<void> {
  const response: HttpResponse<null> = await inviteService.revoke(invite.id);

  if (response.isSuccess) {
    await loadPendingInvites();
  } else {
    notificationService.showError(response.error);
  }
}

async function onInviteSaved(): Promise<void> {
  await loadPendingInvites();
}

function canRemove(member: TeamMemberDto): boolean {
  return props.isOwner || member.user?.id === currentUserId.value;
}

onMounted(loadPendingInvites);
</script>

<template>
  <Card>
    <template #title>
      <div class="roster__header">
        <span>{{ t('teams.members') }}</span>
        <Button
          v-if="isOwner"
          :label="t('invites.invite')"
          icon="pi pi-user-plus"
          size="small"
          @click="isInviteDialogVisible = true"
        />
      </div>
    </template>
    <template #content>
      <div v-if="team.members.length === 0" class="roster__empty">
        <i class="pi pi-user-plus" />
        <p>{{ t('teams.noMembers') }}</p>
      </div>

      <DataTable v-else :value="team.members" data-key="id">
        <Column :header="t('auth.username')">
          <template #body="{ data }">
            <div class="roster__member">
              <Avatar
                :image="data.user?.avatarUrl ?? undefined"
                :label="
                  data.user?.avatarUrl
                    ? undefined
                    : data.user?.username[0]?.toUpperCase()
                "
                shape="circle"
              />
              <span>{{ data.user?.username }}</span>
            </div>
          </template>
        </Column>

        <Column field="role" :header="t('teams.role')">
          <template #body="{ data }">
            <Select
              v-if="isOwner"
              :model-value="data.role"
              :options="roleOptions"
              option-label="label"
              option-value="value"
              size="small"
              @update:model-value="
                (role: TeamMemberRole) => changeRole(data, role)
              "
            />
            <Tag
              v-else
              :value="t(`teams.roles.${data.role}`)"
              :severity="ROLE_SEVERITIES[data.role as TeamMemberRole]"
            />
          </template>
        </Column>

        <Column field="createdAt" :header="t('teams.joined')">
          <template #body="{ data }">
            {{ dateService.formatDate(data.createdAt) }}
          </template>
        </Column>

        <Column>
          <template #body="{ data }">
            <Button
              v-if="canRemove(data)"
              :icon="
                data.user?.id === currentUserId
                  ? 'pi pi-sign-out'
                  : 'pi pi-times'
              "
              :aria-label="
                data.user?.id === currentUserId
                  ? t('invites.leave')
                  : t('invites.kick')
              "
              severity="danger"
              text
              rounded
              size="small"
              @click="confirmRemove(data)"
            />
          </template>
        </Column>
      </DataTable>

      <template v-if="isOwner && pendingInvites.length > 0">
        <Divider />
        <div class="roster__pending">
          <span class="roster__pending-title">
            {{ t('invites.pending') }}
          </span>
          <div
            v-for="invite in pendingInvites"
            :key="invite.id"
            class="roster__invite"
          >
            <Avatar
              :image="invite.invitedUser?.avatarUrl ?? undefined"
              :label="
                invite.invitedUser?.avatarUrl
                  ? undefined
                  : invite.invitedUser?.username[0]?.toUpperCase()
              "
              shape="circle"
            />
            <span class="roster__invite-name">
              {{ invite.invitedUser?.username }}
            </span>
            <Tag
              :value="t(`teams.roles.${invite.role}`)"
              severity="secondary"
            />
            <Button
              :label="t('invites.revoke')"
              severity="danger"
              text
              size="small"
              @click="revokeInvite(invite)"
            />
          </div>
        </div>
      </template>
    </template>
  </Card>

  <InviteFormDialog
    v-model:visible="isInviteDialogVisible"
    :team-id="team.id"
    @saved="onInviteSaved"
  />
</template>

<style lang="scss" scoped>
.roster {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__member {
    display: flex;
    align-items: center;
    gap: 0.75rem;
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

  &__pending {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__pending-title {
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: $text-muted;
  }

  &__invite {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__invite-name {
    font-weight: 500;
  }
}
</style>
