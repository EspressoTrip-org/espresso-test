import { describe, test, expect } from 'vitest';

import * as defs from '../src/schema/definitions';
import * as satisfiers from '../src/satisfiers';

describe('label satisfies', () => {
  const scoped_permissions: defs.Permission[] = [
    {
      action: 'create',
      resource: {
        scope: '123',
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

  const create_action = 'create';

  test('does not satisfy id selector', () => {
    expect(
      satisfiers.satisfies(scoped_permissions, create_action, {
        scope: '123',
        selector: {
          model: 'app',
          id: '456'
        }
      })
    ).toBeFalsy();
  });

  test('satisfies label selector', () => {
    expect(
      satisfiers.satisfies(scoped_permissions, create_action, {
        scope: '123',
        selector: {
          model: 'app',
          id: '456',
          labels: {
            a: 'b',
            c: 'd',
            e: 'f'
          }
        }
      })
    ).toBeTruthy();
  });

  test('does not satisfy label selector [missing label]', () => {
    expect(
      satisfiers.satisfies(scoped_permissions, create_action, {
        scope: '123',
        selector: {
          model: 'app',
          id: '456',
          labels: {
            c: 'd'
          }
        }
      })
    ).toBeFalsy();
  });

  test('does not satisfy label selector [label mismatch]', () => {
    expect(
      satisfiers.satisfies(scoped_permissions, create_action, {
        scope: '123',
        selector: {
          model: 'app',
          id: '456',
          labels: {
            a: '1',
            c: 'd'
          }
        }
      })
    ).toBeFalsy();
  });

  test('does not satisfy label selector [no permission labels]', () => {
    const permissions = [
      {
        action: 'create',
        resource: {
          scope: '123',
          selector: {
            model: 'app',
            labels: {}
          }
        }
      }
    ];
    expect(
      satisfiers.satisfies(permissions, create_action, {
        scope: '123',
        selector: {
          model: 'app',
          id: '456',
          labels: {
            a: '1',
            c: 'd'
          }
        }
      })
    ).toBeFalsy();
  });

  test('wildcard id selector satisfies label comparison', () => {
    const permissions = [
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
    expect(
      satisfiers.satisfies(permissions, create_action, {
        scope: '123',
        selector: {
          model: 'app',
          labels: {
            a: '1',
            c: 'd'
          }
        }
      })
    ).toBeTruthy();
  });

  test('$or labels should satisfy correctly', () => {
    const permissions: defs.Permission[] = [
      {
        action: 'create',
        resource: {
          scope: '123',
          selector: {
            model: 'app',
            labels: {
              a: ['1', '2'],
              c: ['d', 'x']
            }
          }
        }
      },
      {
        action: 'create',
        resource: {
          scope: '123',
          selector: {
            model: 'app',
            labels: {
              e: ['1']
            }
          }
        }
      }
    ];

    expect(
      satisfiers.satisfies(permissions, create_action, {
        scope: '123',
        selector: {
          model: 'app',
          labels: {
            a: '2',
            c: 'x'
          }
        }
      })
    ).toBeTruthy();

    expect(
      satisfiers.satisfies(permissions, create_action, {
        scope: '123',
        selector: {
          model: 'app',
          labels: {
            a: '56',
            c: '234'
          }
        }
      })
    ).toBeFalsy();

    expect(
      satisfiers.satisfies(permissions, create_action, {
        scope: '123',
        selector: {
          model: 'app',
          labels: {
            a: '2'
          }
        }
      })
    ).toBeFalsy();

    expect(
      satisfiers.satisfies(permissions, create_action, {
        scope: '123',
        selector: {
          model: 'app',
          labels: {
            e: ['n', '1']
          }
        }
      })
    ).toBeFalsy();
  });
});
