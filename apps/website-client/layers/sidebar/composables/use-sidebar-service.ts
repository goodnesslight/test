import { computed, type ComputedRef, type Ref, ref } from 'vue';

import type { ServerOnlineResponseDto } from '@shared/dtos';

import IconMatches from '../components/icons/IconMatches.vue';
import IconPlay from '../components/icons/IconPlay.vue';
import { SidebarNavItem } from '../types';

export interface SidebarService {
  navItems: ComputedRef<SidebarNavItem[]>;
  onlineCount: Ref<string>;
  startOnlinePolling: () => void;
  stopOnlinePolling: () => void;
}

export function useSidebarService(): SidebarService {
  const navItems: ComputedRef<SidebarNavItem[]> = computed(() => [
    {
      to: '/play',
      label: t('sidebar.navItems.play'),
      icon: IconPlay,
    },
    {
      to: '/matches',
      label: t('sidebar.navItems.matches'),
      icon: IconMatches,
    },
  ]);

  const { t } = useI18n();

  const serverService: ServerService = useServerService();

  const onlineCount: Ref<string> = ref('0');
  let onlineRefreshInterval: ReturnType<typeof setInterval> | null = null;

  async function fetchOnline(): Promise<void> {
    const data: ServerOnlineResponseDto | null =
      await serverService.fetchOnline();

    if (data) {
      onlineCount.value = data.count.toLocaleString('en-US');
    }
  }

  function startOnlinePolling(): void {
    fetchOnline();
    onlineRefreshInterval = setInterval(fetchOnline, 5_000);
  }

  function stopOnlinePolling(): void {
    if (onlineRefreshInterval) {
      clearInterval(onlineRefreshInterval);
      onlineRefreshInterval = null;
    }
  }

  return {
    navItems,
    onlineCount,
    startOnlinePolling,
    stopOnlinePolling,
  };
}
