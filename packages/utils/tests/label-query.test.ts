import { describe, test, expect } from 'vitest';

import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as permission_utils from '../src/query';
import * as mongo from 'mongodb';

describe('label query generation', () => {
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
          labels: {
            type: 'test'
          }
        }
      }
    },
    {
      action: 'read',
      resource: {
        scope: '5ee204ddae8864186979d780',
        selector: {
          model: 'app',
          labels: {
            type: 'test',
            owner: 'abc'
          }
        }
      }
    }
  ];

  test('construct mongodb filter query from label permissions', () => {
    const filter = permission_utils.createOrgScopedFilterQueryFromPermissionSet(permissions, {
      models: ['app'],
      query
    });

    expect(filter).toMatchSnapshot();
  });

  test('empty label set should not produce a query', () => {
    const permissions = [
      {
        action: 'read',
        resource: {
          scope: '5ee204ddae8864186979d780',
          selector: {
            model: 'app',
            labels: {}
          }
        }
      }
    ];
    const filter = permission_utils.createOrgScopedFilterQueryFromPermissionSet(permissions, {
      models: ['app'],
      query
    });

    expect(filter).toBeNull();
  });

  test('custom label mapper should produce non-standard query', () => {
    const permissions = [
      {
        action: 'read',
        resource: {
          scope: '5ee204ddae8864186979d780',
          selector: {
            model: 'app',
            labels: {
              a: 'b',
              c: 'd'
            }
          }
        }
      }
    ];
    const filter = permission_utils.createOrgScopedFilterQueryFromPermissionSet(permissions, {
      models: ['app'],
      map_labels: (key, value) => {
        return {
          [`things.${key}`]: value
        };
      },
      query
    });

    expect(filter).toMatchSnapshot();
  });
});
