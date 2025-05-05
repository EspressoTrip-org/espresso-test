import * as cardinal from '@journeyapps-platform/types-cardinal';

export type PolicyCache = {
  get: (key: string) => Promise<cardinal.RawPolicy[] | null>;
  set: (key: string, policies: cardinal.RawPolicy[]) => Promise<void>;
  clear: () => Promise<void>;
};
