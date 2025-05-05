import { describe, test, expect } from 'vitest';

import * as cache_managers from '../src/cache-managers';

const fake_policy = {
  id: '123',
  statements: []
};

describe('in-memory-cache-manager', () => {
  test('it clears least used on set', async () => {
    const cache = cache_managers.createInMemoryCacheManager({
      max_size: 2
    });

    await cache.setPoliciesForPrincipal('1', [fake_policy]);

    await new Promise((resolve) => setTimeout(resolve, 5));

    await cache.setPoliciesForPrincipal('2', [fake_policy]);

    expect(await cache.getPoliciesForPrincipal('1')).toEqual([fake_policy]);
    expect(await cache.getPoliciesForPrincipal('2')).toEqual([fake_policy]);

    await cache.setPoliciesForPrincipal('3', [fake_policy]);

    expect(await cache.getPoliciesForPrincipal('1')).toEqual(null);
    expect(await cache.getPoliciesForPrincipal('2')).toEqual([fake_policy]);
    expect(await cache.getPoliciesForPrincipal('3')).toEqual([fake_policy]);
  });

  test('it clears only associated policies', async () => {
    const cache = cache_managers.createInMemoryCacheManager({
      max_size: 2
    });

    const policy1 = {
      id: '1',
      statements: []
    };
    const policy2 = {
      id: '2',
      statements: []
    };

    await cache.setPoliciesForPrincipal('1', [policy1, policy2]);

    await new Promise((resolve) => setTimeout(resolve, 5));

    await cache.setPoliciesForPrincipal('2', [policy1]);

    expect(await cache.getPoliciesForPrincipal('1')).toEqual([policy1, policy2]);
    expect(await cache.getPoliciesForPrincipal('2')).toEqual([policy1]);

    await cache.setPoliciesForPrincipal('3', [fake_policy]);

    expect(await cache.getPoliciesForPrincipal('1')).toEqual(null);
    expect(await cache.getPoliciesForPrincipal('2')).toEqual([policy1]);
  });

  test('it handles principals that do not exist', async () => {
    const cache = cache_managers.createInMemoryCacheManager();
    await cache.invalidatePrincipal('fake');
  });

  test('it invalidates all principals of a policy', async () => {
    const cache = cache_managers.createInMemoryCacheManager();

    const policy1 = {
      id: '1',
      statements: []
    };
    const policy2 = {
      id: '2',
      statements: []
    };

    await cache.setPoliciesForPrincipal('1', [policy1, policy2]);
    await cache.setPoliciesForPrincipal('2', [policy1]);
    await cache.setPoliciesForPrincipal('3', [policy2]);

    expect(await cache.getPoliciesForPrincipal('1')).toEqual([policy1, policy2]);
    expect(await cache.getPoliciesForPrincipal('2')).toEqual([policy1]);
    expect(await cache.getPoliciesForPrincipal('3')).toEqual([policy2]);

    await cache.invalidatePolicy('1');

    expect(await cache.getPoliciesForPrincipal('1')).toEqual(null);
    expect(await cache.getPoliciesForPrincipal('2')).toEqual(null);
    expect(await cache.getPoliciesForPrincipal('3')).toEqual([policy2]);
  });

  test('it correctly invalidates principals', async () => {
    const cache = cache_managers.createInMemoryCacheManager();

    const policy1 = {
      id: '1',
      statements: []
    };

    await cache.setPoliciesForPrincipal('1', [policy1]);
    await cache.setPoliciesForPrincipal('2', [policy1]);

    expect(await cache.getPoliciesForPrincipal('1')).toEqual([policy1]);
    expect(await cache.getPoliciesForPrincipal('2')).toEqual([policy1]);

    await cache.invalidatePrincipal('1');

    expect(await cache.getPoliciesForPrincipal('1')).toEqual(null);
    expect(await cache.getPoliciesForPrincipal('2')).toEqual([policy1]);
  });
});
