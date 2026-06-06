import { computed, type ComputedRef } from 'vue';

import { TeamMemberRole } from '@shared/types';

export interface TeamRoleOption {
  label: string;
  value: TeamMemberRole;
}

export function useTeamRoleOptions(): ComputedRef<TeamRoleOption[]> {
  const { t } = useI18n();

  return computed((): TeamRoleOption[] =>
    Object.values(TeamMemberRole).map(
      (value: TeamMemberRole): TeamRoleOption => ({
        label: t(`teams.roles.${value}`),
        value,
      })
    )
  );
}
