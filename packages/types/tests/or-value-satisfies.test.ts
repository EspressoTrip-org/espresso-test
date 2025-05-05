import { describe, test, expect } from 'vitest';

import * as defs from '../src/schema/definitions';
import * as satisfiers from '../src/satisfiers';

type Fixture = {
  permissions: defs.Permission[];
  action: defs.$Or<string>;
  comparison: defs.Resource;
  result: boolean;
};

describe('fixtures with $or value definitions', () => {
  const permissions: defs.Permission[] = [
    {
      action: ['read', 'write'],
      resource: {
        scope: ['123', '456'],
        selector: {
          model: ['app', 'user'],
          id: ['123']
        }
      }
    },
    {
      action: ['read', 'write'],
      resource: {
        selector: {
          model: ['app', 'user'],
          id: ['123']
        }
      }
    },
    {
      action: ['read', 'write'],
      resource: {
        selector: {
          model: ['app', 'user'],
          labels: {
            a: ['b', 'c'],
            d: 'e'
          }
        }
      }
    },
    {
      action: ['read', 'write', 'parent'],
      resource: {
        selector: {
          model: ['app', 'user'],
          id: ['123'],
          parents: [
            {
              model: ['app'],
              id: ['456', '789']
            }
          ]
        }
      }
    }
  ];

  const fixtures: Fixture[] = [
    {
      permissions: permissions,
      action: 'read',
      comparison: {
        scope: ['456'],
        selector: {
          model: 'user',
          id: '123'
        }
      },
      result: true
    },
    {
      permissions: permissions,
      action: 'nothing',
      comparison: {
        scope: ['456'],
        selector: {
          model: 'user',
          id: '123'
        }
      },
      result: false
    },
    {
      permissions: permissions,
      action: ['write'],
      comparison: {
        selector: {
          model: 'app',
          labels: {
            a: 'c',
            d: 'e'
          }
        }
      },
      result: true
    },
    {
      permissions: permissions,
      action: ['parent'],
      comparison: {
        selector: {
          model: 'app',
          id: '123',
          parents: [
            {
              model: 'user',
              id: '1'
            }
          ]
        }
      },
      result: false
    },
    {
      permissions: permissions,
      action: ['parent'],
      comparison: {
        selector: {
          model: 'app',
          id: '123',
          parents: [
            {
              model: 'app',
              id: '789'
            }
          ]
        }
      },
      result: true
    }
  ];

  let i = 0;
  for (const fixture of fixtures) {
    test(`fixture ${i}`, () => {
      expect(satisfiers.satisfies(fixture.permissions, fixture.action, fixture.comparison)).toBe(fixture.result);
    });
    i++;
  }
});
