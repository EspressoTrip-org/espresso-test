import { describe, test, expect } from 'vitest';

import * as policy_utils from '../src/policy-utils';
import * as defs from '../src/schema/definitions';
import * as satisfier from '../src/satisfiers';

describe('policy-utils', () => {
  test('policy deserialization', () => {
    const permissions = policy_utils.createPermissionsFromPolicies([
      {
        name: 'first',
        statements: [
          {
            actions: ['read', 'write'],
            resources: [
              {
                scope: '123',
                selector: {
                  model: 'draft',
                  id: '*',
                  parents: [
                    {
                      model: 'user',
                      id: '1'
                    }
                  ]
                }
              }
            ]
          },
          {
            actions: ['list'],
            resources: [
              {
                scope: ['123', '456'],
                selector: {
                  model: ['app', 'draft'],
                  id: '*'
                }
              }
            ]
          }
        ]
      },
      {
        name: 'second',
        statements: [
          {
            actions: ['*'],
            resources: [
              {
                scope: '*',
                selector: {
                  model: 'user',
                  id: ['1', '2']
                }
              }
            ]
          }
        ]
      },
      {
        name: 'third',
        statements: [
          {
            actions: ['read'],
            effect: defs.PERMISSION_EFFECT.Deny,
            resources: [
              {
                scope: '123',
                selector: {
                  model: 'user',
                  id: '2'
                }
              }
            ]
          }
        ]
      }
    ]);
    expect(permissions).toMatchSnapshot();
  });

  test('accumulative access should work with cartesian product', () => {
    const actor_policy: defs.Policy = {
      statements: [
        {
          actions: ['a', 'b'],
          resources: [
            {
              scope: '123',
              selector: {
                model: 'deployment',
                id: '*'
              }
            }
          ]
        },
        {
          actions: ['c', 'd'],
          resources: [
            {
              scope: '123',
              selector: {
                model: 'deployment',
                id: '*'
              }
            }
          ]
        }
      ]
    };

    const comparison_policy: defs.Policy = {
      statements: [
        {
          actions: ['a', 'd'],
          resources: [
            {
              scope: '123',
              selector: {
                model: 'deployment',
                id: '*'
              }
            }
          ]
        }
      ]
    };

    expect(
      satisfier.allPermissionsSatisfyAllFilters(
        policy_utils.createPermissionsFromPolicy(comparison_policy),
        satisfier.canAssignPermission(policy_utils.createPermissionsFromPolicy(actor_policy))
      )
    ).toBe(true);
  });
});
