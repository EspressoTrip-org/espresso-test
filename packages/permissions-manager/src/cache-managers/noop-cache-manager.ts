import * as cache_manager from './cache-manager';

export const createNoopCacheManager = (): cache_manager.CacheManager => {
  return {
    async invalidatePolicy() {},
    async invalidatePrincipal() {},
    async getPoliciesForPrincipal() {
      return null;
    },
    async setPoliciesForPrincipal() {}
  };
};
