import { type ConsolaInstance, createConsola } from 'consola';

import { LOGGER_OPTIONS } from '../constants';

export type LoggerService = ConsolaInstance;

const instance: ConsolaInstance = createConsola(LOGGER_OPTIONS);

export function useLoggerService(tag?: string): LoggerService {
  if (!tag) {
    return instance;
  }

  return instance.withTag(tag);
}
