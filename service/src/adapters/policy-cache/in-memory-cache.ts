import * as cardinal from '@journeyapps-platform/types-cardinal';
import { PolicyCache } from './policy-cache';
import { LRUCache } from 'lru-cache';

export const createInMemoryPolicyCache = (): PolicyCache => {
  const cache = new LRUCache<string, cardinal.RawPolicy[]>({
    ttl: 5 * 60 * 1000,
    maxSize: 1024 * 1024 * 50,
    sizeCalculation: (policies) => {
      return JSON.stringify(policies).length;
    }
  });

  return {
    get: async (key) => {
      return cache.get(key) || null;
    },
    set: async (key, policies) => {
      cache.set(key, policies);
    },
    clear: async () => {
      cache.clear();
    }
  };
};
