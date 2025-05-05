import { describe, test, expect } from 'vitest';

import * as defs from '../src/schema/definitions';
import * as satisfiers from '../src/satisfiers';

describe('deny permissions', () => {
  const scoped_permissions: defs.Permission[] = [
    {
      action: 'create',
      resource: {
        scope: '123',
        selector: {
          model: 'app',
          id: '*'
        }
      }
    }
  ];

  const deny_scoped_permissions: defs.Permission[] = [
    {
      action: 'create',
      effect: defs.PERMISSION_EFFECT.Deny,
      resource: {
        scope: '123',
        selector: {
          model: 'app',
          id: '456'
        }
      }
    },
    {
      action: 'create',
      effect: defs.PERMISSION_EFFECT.Deny,
      resource: {
        scope: '123',
        selector: {
          model: 'app',
          labels: {
            a: 'b'
          }
        }
      }
    }
  ];

  const permissions = scoped_permissions.concat(deny_scoped_permissions);

  const create_action = 'create';

  test('does not satisfy due to deny [id]', () => {
    expect(
      satisfiers.satisfies(permissions, create_action, {
        scope: '123',
        selector: {
          model: 'app',
          id: '456'
        }
      })
    ).toBeFalsy();
  });

  test('does not satisfy due to deny [label]', () => {
    expect(
      satisfiers.satisfies(permissions, create_action, {
        scope: '123',
        selector: {
          model: 'app',
          labels: {
            a: 'b'
          }
        }
      })
    ).toBeFalsy();
  });

  test('satisfies resource that does not match deny', () => {
    expect(
      satisfiers.satisfies(permissions, create_action, {
        scope: '123',
        selector: {
          model: 'app',
          id: '4567'
        }
      })
    ).toBeTruthy();
  });
});
