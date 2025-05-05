import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro_db from '@journeyapps-platform/micro-db';

export type CacheManager = {
  getPoliciesForPrincipal: (id: string) => Promise<cardinal.Policy[] | null>;
  setPoliciesForPrincipal: (id: string, policies: (micro_db.SerializedId & cardinal.Policy)[]) => Promise<void>;
  invalidatePolicy: (id: string) => Promise<void>;
  invalidatePrincipal: (id: string) => Promise<void>;
};
