import { CacheService } from '@modules/cache/cache.service';
import { CacheKey } from '@modules/cache/cache.type';
import { GameDig } from 'gamedig';

import { ServerOnlineResponseDto } from '@shared/dtos';
import { ServerType } from '@shared/types';

import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { ServerEntity } from './server.entity';
import { ServerRepository } from './server.repository';
import {
  GameDigProviderType,
  GameDigStateResponse,
  ServerCache,
} from './server.type';

@Injectable()
export class ServerService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly serverRepository: ServerRepository
  ) {}

  async getOnline(): Promise<ServerOnlineResponseDto> {
    const servers: ServerCache[] = await this.getList();
    return {
      count: servers.reduce(
        (sum: number, server: ServerCache): number =>
          sum + server.currentPlayers,
        0
      ),
    };
  }

  async getList(type?: ServerType): Promise<ServerCache[]> {
    const cached: ServerCache[] | null = await this.cacheService.get(
      CacheKey.SERVERS
    );

    const servers: ServerCache[] = cached ?? (await this.refreshServers());

    if (type) {
      return servers.filter(
        (server: ServerCache): boolean => server.type === type
      );
    }

    return servers;
  }

  @Interval(5_000)
  private async refreshServers(): Promise<ServerCache[]> {
    const servers: ServerEntity[] = await this.serverRepository.find();
    const allServersToCache: (ServerCache | null)[] = await Promise.all(
      servers.map(
        (server: ServerEntity): Promise<ServerCache | null> =>
          this.mapServerToCache(server)
      )
    );

    const onlineServersToCache: ServerCache[] = allServersToCache.filter(
      (result): result is ServerCache => result !== null
    );

    await this.cacheService.set(CacheKey.SERVERS, onlineServersToCache);
    return onlineServersToCache;
  }

  private async mapServerToCache(
    server: ServerEntity
  ): Promise<ServerCache | null> {
    try {
      const state: GameDigStateResponse = await GameDig.query({
        host: server.ip,
        port: server.port,
        type: GameDigProviderType.COUNTER_STRIKE_2,
      });

      return {
        ip: server.ip,
        port: server.port,
        type: server.type,
        map: state.map,
        maxPlayers: state.maxplayers,
        currentPlayers: state.numplayers,
      };
    } catch {
      return null;
    }
  }
}
