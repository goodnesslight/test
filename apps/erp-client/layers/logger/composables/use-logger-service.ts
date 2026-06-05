import { type ConsolaInstance, createConsola, LogLevels } from 'consola';

const instance: ConsolaInstance = createConsola({
  level: LogLevels.info,
  formatOptions: {
    date: true,
    colors: true,
    compact: false,
  },
});

export function useLoggerService(tag?: string): ConsolaInstance {
  if (!tag) {
    return instance;
  }

  return instance.withTag(tag);
}
