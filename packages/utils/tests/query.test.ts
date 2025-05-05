import { describe, test, expect } from 'vitest';

import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as permission_utils from '../src/query';
import * as mongo from 'mongodb';

describe('query construction', () => {
  type Model = {
    id: string;
    org_id: string;
    name: string;
  };

  const query: mongo.Filter<Model> = {
    name: /^app.*/
  };

  const permissions: cardinal.Permission[] = [
    {
      action: 'read',
      resource: {
        scope: '5ee204dcae8864186979d77f',
        selector: {
          model: 'app',
          id: '5ee204dcae8864186979d77f'
        }
      }
    },
    {
      action: 'read',
      resource: {
        scope: '5ee204ddae8864186979d780',
        selector: {
          model: 'app',
          id: '5ee204ddae8864186979d780'
        }
      }
    }
  ];

  test('construct mongodb filter query from permissions', () => {
    const filter = permission_utils.createFilterQueryFromPermissionSet(
      permissions,
      (permission) => {
        if (permission.resource.selector.model !== 'app') {
          return;
        }
        if (!cardinal.isIDResourceSelector(permission.resource.selector)) {
          return;
        }
        return {
          org_id: {
            $in: cardinal.castToArray(permission.resource.scope!)
          },
          id: {
            $in: cardinal.castToArray(permission.resource.selector.id)
          }
        };
      },
      query
    );

    expect(filter).toMatchSnapshot();
  });

  test('construct mongodb filter query from permissions using org scoped tools', () => {
    const filter = permission_utils.createOrgScopedFilterQueryFromPermissionSet(permissions, {
      models: ['app'],
      query
    });

    expect(filter).toMatchSnapshot();
  });

  test('construct query with wildcards', () => {
    const permissions: cardinal.Permission[] = [
      {
        action: 'read',
        resource: {
          scope: '5ee204dcae8864186979d77f',
          selector: {
            model: 'app',
            id: '*'
          }
        }
      }
    ];

    const filter = permission_utils.createOrgScopedFilterQueryFromPermissionSet(permissions, {
      models: ['app'],
      query
    });

    expect(filter).toMatchSnapshot();
  });

  test('construct query with action and model wildcards', () => {
    const permissions: cardinal.Permission[] = [
      {
        action: '*',
        resource: {
          scope: '5ee204dcae8864186979d77f',
          selector: {
            model: '*',
            id: '*'
          }
        }
      }
    ];

    const filter = permission_utils.createOrgScopedFilterQueryFromPermissionSet(permissions, {
      models: ['app'],
      actions: ['read'],
      query
    });

    expect(filter).toMatchSnapshot();
  });

  test('construct query with scopeless selector', () => {
    const permissions: cardinal.Permission[] = [
      {
        action: 'read',
        resource: {
          selector: {
            model: 'app',
            id: '5ee204dcae8864186979d77f'
          }
        }
      }
    ];

    const filter = permission_utils.createOrgScopedFilterQueryFromPermissionSet(permissions, {
      models: ['app'],
      query
    });

    expect(filter).toMatchSnapshot();
  });

  test('construct query with scoped and scopeless selector', () => {
    const permissions: cardinal.Permission[] = [
      {
        action: 'read',
        resource: {
          selector: {
            model: 'app',
            id: '5ee204dcae8864186979d77f'
          }
        }
      },
      {
        action: 'read',
        resource: {
          scope: '5ee204dcae8864186979d77f',
          selector: {
            model: 'app',
            id: '5ee204ddae8864186979d780'
          }
        }
      }
    ];

    const filter = permission_utils.createOrgScopedFilterQueryFromPermissionSet(permissions, {
      models: ['app'],
      query
    });

    expect(filter).toMatchSnapshot();
  });

  test('construct query from relevant permissions', () => {
    const permissions: cardinal.Permission[] = [
      {
        action: 'read',
        resource: {
          selector: {
            model: 'app',
            id: '5ee204dcae8864186979d77f'
          }
        }
      },
      {
        action: 'write',
        resource: {
          scope: '5ee204dcae8864186979d77f',
          selector: {
            model: 'app',
            id: '5ee204dcae8864186979d77f'
          }
        }
      },
      {
        action: 'read',
        resource: {
          scope: '5ee204dcae8864186979d77f',
          selector: {
            model: 'book',
            id: '5ee204dcae8864186979d77f'
          }
        }
      }
    ];

    const filter = permission_utils.createOrgScopedFilterQueryFromPermissionSet(permissions, {
      models: ['app'],
      query
    });

    expect(filter).toMatchSnapshot();
  });

  test('construct query empty permissions set', () => {
    const permissions: cardinal.Permission[] = [];

    const filter = permission_utils.createOrgScopedFilterQueryFromPermissionSet(permissions, {
      models: ['app'],
      query
    });

    expect(filter).toEqual(null);
  });

  test('should handle malformed ids correctly', () => {
    const permissions: cardinal.Permission[] = [
      {
        action: 'read',
        resource: {
          scope: '123',
          selector: {
            model: 'app',
            id: '456'
          }
        }
      }
    ];

    const filter = permission_utils.createOrgScopedFilterQueryFromPermissionSet(permissions, {
      models: ['app'],
      query
    });

    expect(filter).toMatchSnapshot();
  });
});
