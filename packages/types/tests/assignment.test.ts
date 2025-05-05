import { describe, test, expect } from 'vitest';

import * as defs from '../src/schema/definitions';
import * as satisfiers from '../src/satisfiers';

describe('assignment', () => {
  test('should not be able to assign higher access policies with intersections', () => {
    const primary: defs.Permission = {
      action: ['read'],
      resource: {
        selector: {
          model: ['app', 'thing'],
          id: '*'
        }
      }
    };

    const action_intersection: defs.Permission = {
      action: ['read', 'create'],
      resource: {
        selector: {
          model: 'app',
          id: '*'
        }
      }
    };

    const model_intersection: defs.Permission = {
      action: ['read'],
      resource: {
        selector: {
          model: ['app', 'user'],
          id: '*'
        }
      }
    };

    const filter = satisfiers.canAssignPermission([primary]);

    expect(satisfiers.allPermissionsSatisfyAllFilters([action_intersection], filter)).toBe(false);
    expect(satisfiers.allPermissionsSatisfyAllFilters([model_intersection], filter)).toBe(false);
  });
});
