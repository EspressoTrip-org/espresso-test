import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro_db from '@journeyapps-platform/micro-db';
import * as cache_manager from './cache-manager';
import { LRUCache } from 'lru-cache';

type InMemoryCacheParams = {
  max_size?: number;
  ttl?: number;
};

/**
 * Create an LRU in-memory cache manager with entry ttl
 */
export const createInMemoryCacheManager = (params?: InMemoryCacheParams): cache_manager.CacheManager => {
  const max_size = params?.max_size || 1000;
  const ttl = params?.ttl || 5 * 60 * 1000;

  const cache = new LRUCache<string, (micro_db.SerializedId & cardinal.Policy)[]>({
    max: max_size,
    ttl: ttl
  });

  return {
    async getPoliciesForPrincipal(id) {
      const policies = cache.get(id);
      if (!policies) {
        return null;
      }

      return policies;
    },

    async setPoliciesForPrincipal(principal, policies) {
      if (policies.length === 0) {
        return;
      }

      cache.set(principal, policies);
    },
    async invalidatePolicy(id) {
      cache.forEach((policies, key) => {
        const matches = policies.find((policy) => policy.id === id);
        if (matches) {
          cache.delete(key);
        }
      });
    },
    async invalidatePrincipal(id) {
      cache.delete(id);
    }
  };
};
