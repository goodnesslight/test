import { type Ref, ref } from 'vue';
import { RouteLocationNormalizedLoadedGeneric } from 'vue-router';

import { AccountResponseDto } from '@shared/dtos';

export interface ProfileService {
  account: Ref<AccountResponseDto | null>;
}

export function useProfileService(): ProfileService {
  const route: RouteLocationNormalizedLoadedGeneric = useRoute();

  const accountService: AccountService = useAccountService();

  const accountId: number = Number(route.params.id);
  const account: Ref<AccountResponseDto | null> = ref(null);

  accountService.fetchById(accountId).then((data) => {
    account.value = data;
  });

  return {
    account,
  };
}
