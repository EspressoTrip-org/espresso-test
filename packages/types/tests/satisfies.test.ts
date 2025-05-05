import { describe, test, expect } from 'vitest';

import * as defs from '../src/schema/definitions';
import * as satisfiers from '../src/satisfiers';

describe('satisfies', () => {
  const scoped_permissions: defs.Permission[] = [
    {
      action: 'create',
      resource: {
        scope: '123',
        selector: {
          model: 'app',
          id: '456'
        }
      }
    }
  ];
  const unscoped_permissions: defs.Permission[] = [
    {
      action: 'create',
      resource: {
        selector: {
          model: 'app',
          id: '456'
        }
      }
    }
  ];

  const create_action = 'create';
  const read_action = 'read';

  test('satisfy scoped resource', () => {
    expect(
      satisfiers.satisfies(scoped_permissions, create_action, {
        scope: '123',
        selector: {
          model: 'app',
          id: '456'
        }
      })
    ).toBeTruthy();
  });

  test('satisfy unscoped resource', () => {
    expect(
      satisfiers.satisfies(unscoped_permissions, create_action, {
        selector: {
          model: 'app',
          id: '456'
        }
      })
    ).toBeTruthy();
  });

  test('does not satisfy unscoped permission with scoped requirement', () => {
    expect(
      satisfiers.satisfies(unscoped_permissions, create_action, {
        scope: '123',
        selector: {
          model: 'app',
          id: '456'
        }
      })
    ).toBeFalsy();
  });

  test('does not satisfy scoped permission with unscoped requirement', () => {
    expect(
      satisfiers.satisfies(scoped_permissions, create_action, {
        selector: {
          model: 'app',
          id: '456'
        }
      })
    ).toBeFalsy();
  });

  test('satisfy permission wildcards', () => {
    const permission: defs.Permission = {
      action: 'create',
      resource: {
        scope: '*',
        selector: {
          model: '*',
          id: '*'
        }
      }
    };
    expect(
      satisfiers.satisfies([permission], create_action, {
        scope: '123',
        selector: {
          model: 'app',
          id: '789'
        }
      })
    ).toBeTruthy();
  });

  test('satisfy from multiple permissions', () => {
    const permission: defs.Permission = {
      action: 'read',
      resource: {
        scope: '*',
        selector: {
          model: '*',
          id: '*'
        }
      }
    };
    expect(
      satisfiers.satisfies([...scoped_permissions, permission], read_action, {
        scope: '123',
        selector: {
          model: 'app',
          id: '456'
        }
      })
    ).toBeTruthy();
  });

  test('does not satisfy due to mismatch requirement org', () => {
    expect(
      satisfiers.satisfies(scoped_permissions, create_action, {
        scope: 'invalid',
        selector: {
          model: 'app',
          id: '456'
        }
      })
    ).toBeFalsy();
  });

  test('does not satisfy due to mismatch requirement resource-type', () => {
    expect(
      satisfiers.satisfies(scoped_permissions, create_action, {
        scope: '123',
        selector: {
          model: 'invalid',
          id: '456'
        }
      })
    ).toBeFalsy();
  });

  test('does not satisfy due to mismatch requirement selector', () => {
    expect(
      satisfiers.satisfies(scoped_permissions, read_action, {
        scope: '123',
        selector: {
          model: 'app',
          id: 'invalid'
        }
      })
    ).toBeFalsy();
  });

  test('does not satisfy due to mismatch requirement action', () => {
    const invalid_op_action = 'invalid';
    expect(
      satisfiers.satisfies(scoped_permissions, invalid_op_action, {
        scope: '123',
        selector: {
          model: 'app',
          id: '456'
        }
      })
    ).toBeFalsy();
  });

  test('satisfies permission with single relationship', () => {
    const permission: defs.Permission = {
      action: 'create',
      resource: {
        scope: '123',
        selector: {
          model: 'draft',
          id: '*',
          parents: [
            {
              model: 'user',
              id: '456'
            }
          ]
        }
      }
    };
    expect(
      satisfiers.satisfies([permission], create_action, {
        scope: '123',
        selector: {
          model: 'draft',
          id: '1',
          parents: [
            {
              model: 'user',
              id: '456'
            }
          ]
        }
      })
    ).toBeTruthy();
  });

  test('satisfies permission with complex relationship', () => {
    const permission: defs.Permission = {
      action: 'create',
      resource: {
        scope: '123',
        selector: {
          model: 'c',
          id: '3',
          parents: [
            {
              model: 'b',
              id: '2',
              parents: [
                {
                  model: 'a',
                  id: '1'
                }
              ]
            }
          ]
        }
      }
    };
    expect(
      satisfiers.satisfies([permission], create_action, {
        scope: '123',
        selector: {
          model: 'c',
          id: '3',
          parents: [
            {
              model: 'random-model',
              id: 'random-id'
            },
            {
              model: 'b',
              id: '2',
              parents: [
                {
                  model: 'random-model-2',
                  id: 'random-id-2'
                },
                {
                  model: 'a',
                  id: '1'
                }
              ]
            }
          ]
        }
      })
    ).toBeTruthy();
  });

  test('satisfies relationship-less permission with complex comparison resource', () => {
    const permission: defs.Permission = {
      action: 'create',
      resource: {
        scope: '123',
        selector: {
          model: 'c',
          id: '*'
        }
      }
    };
    expect(
      satisfiers.satisfies([permission], create_action, {
        scope: '123',
        selector: {
          model: 'c',
          id: '3',
          parents: [
            {
              model: 'random-model',
              id: 'random-id'
            },
            {
              model: 'b',
              id: '2',
              parents: [
                {
                  model: 'random-model-2',
                  id: 'random-id-2'
                },
                {
                  model: 'a',
                  id: '1'
                }
              ]
            }
          ]
        }
      })
    ).toBeTruthy();
  });
});
