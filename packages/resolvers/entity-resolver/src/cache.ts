import * as micro_tracing from '@journeyapps-platform/micro-tracing';
import * as defs from './definitions';
import { LRUCache } from 'lru-cache';

// 250MB, assuming it is storing ObjectId's
const DEFAULT_CACHE_SIZE = 250 * 1024 * 1024;

type Params = {
  max?: number;
};
export const createLRUQueryCache = (params?: Params): defs.ResourceDatabaseCache => {
  const cache = new LRUCache<string, string[]>({
    max: params?.max ?? DEFAULT_CACHE_SIZE,
    sizeCalculation(value) {
      return value.length * 24;
    }
  });

  return {
    async get(key) {
      return micro_tracing.trace('cache-get', () => {
        return cache.get(key) || null;
      });
    },
    async set(key, ids) {
      micro_tracing.trace('cache-set', () => {
        cache.set(key, ids);
      });
    },
    async invalidate(maybe_keys) {
      micro_tracing.trace('cache-invalidate', () => {
        let keys = maybe_keys;
        if (!keys || keys.length === 0) {
          keys = Array.from(cache.keys());
        }

        for (const key of keys) {
          cache.delete(key);
        }
      });
    }
  };
};
