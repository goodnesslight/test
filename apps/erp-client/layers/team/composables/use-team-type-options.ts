import { computed, type ComputedRef } from 'vue';

import { TeamType } from '@shared/types';

export interface TeamTypeOption {
  label: string;
  description: string;
  value: TeamType;
}

export function useTeamTypeOptions(): ComputedRef<TeamTypeOption[]> {
  const { t } = useI18n();

  return computed((): TeamTypeOption[] =>
    Object.values(TeamType).map(
      (value: TeamType): TeamTypeOption => ({
        label: t(`teams.types.${value}`),
        description: t(`teams.typeDescriptions.${value}`),
        value,
      })
    )
  );
}
