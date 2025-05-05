import { describe, test, expect } from 'vitest';

import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as permission_utils from '../src/query';
import * as mongo from 'mongodb';

describe('deny query construction', () => {
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

  test('construct query with wildcards', () => {
    const deny_permissions: cardinal.Permission[] = [
      ...permissions,
      {
        action: 'read',
        effect: cardinal.PERMISSION_EFFECT.Deny,
        resource: {
          scope: '5ee204dcae8864186979d77f',
          selector: {
            model: '*',
            id: '5ee204ddae8864186979d780'
          }
        }
      }
    ];

    const filter = permission_utils.createOrgScopedFilterQueryFromPermissionSet(deny_permissions, {
      models: ['app'],
      query
    });

    expect(filter).toMatchSnapshot();
  });
});
