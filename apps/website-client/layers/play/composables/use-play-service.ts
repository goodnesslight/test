import { type Ref, ref } from 'vue';

import { ServerResponseDto } from '@shared/dtos';
import { ServerType } from '@shared/types';

export interface PlayService {
  servers: Ref<ServerResponseDto[]>;
  activeCategory: Ref<ServerType>;
  setCategory: (category: ServerType) => void;
  copyAddress: (server: ServerResponseDto) => void;
}

export function usePlayService(): PlayService {
  const serverService: ServerService = useServerService();

  const servers: Ref<ServerResponseDto[]> = ref([]);
  const activeCategory: Ref<ServerType> = ref(ServerType.DEATHMATCH);

  function setCategory(category: ServerType): void {
    activeCategory.value = category;
    fetchServers(category);
  }

  function copyAddress(server: ServerResponseDto): void {
    navigator.clipboard.writeText(`${server.ip}:${server.port}`);
  }

  async function fetchServers(type: ServerType): Promise<void> {
    servers.value = await serverService.fetchList(type);
  }

  fetchServers(activeCategory.value);

  return {
    servers,
    activeCategory,
    setCategory,
    copyAddress,
  };
}
