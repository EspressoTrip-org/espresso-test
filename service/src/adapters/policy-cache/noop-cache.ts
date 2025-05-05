import { PolicyCache } from './policy-cache';

export const createNoopPolicyCache = (): PolicyCache => {
  return {
    get: async () => {
      return null;
    },
    set: async () => {},
    clear: async () => {}
  };
};
