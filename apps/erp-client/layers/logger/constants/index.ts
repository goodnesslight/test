import { type ConsolaOptions, LogLevels } from 'consola';

export const LOGGER_OPTIONS: Partial<ConsolaOptions> = {
  level: LogLevels.info,
  formatOptions: {
    date: true,
    colors: true,
    compact: false,
  },
};
