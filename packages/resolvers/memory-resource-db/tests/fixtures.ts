import * as entity_resolver from '@journeyapps-platform/recon-entity-resolver';
import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as memory_db from '../src';

export const seed_data: Record<string, entity_resolver.Document[]> = {
  organization: [
    {
      id: 'o1',
      labels: {
        a: 'b',
        c: 'd'
      }
    },
    {
      id: 'o2',
      labels: {
        e: 'f'
      }
    }
  ],
  app: [
    {
      id: 'a1',
      labels: {
        a: 'b',
        c: 'd'
      }
    },
    {
      id: 'a2',
      labels: {
        a: 'b',
        c: 'd'
      },
      organization_id: 'o1'
    },
    {
      id: 'a3',
      labels: {
        e: 'f'
      },
      organization_id: 'o2'
    }
  ],
  deployment: [
    {
      id: 'd1',
      labels: {
        a: 'b',
        c: 'd'
      },
      app_id: 'a1'
    },
    {
      id: 'd2',
      labels: {
        a: 'b'
      },
      app_id: 'a2'
    },
    {
      id: 'd3',
      labels: {
        a: 'b'
      },
      app_id: 'a2'
    },
    {
      id: 'd4',
      labels: {
        a: 'b'
      },
      app_id: 'a3'
    }
  ],

  user: [
    {
      id: '1',
      organization_id: 'o1'
    }
  ],
  draft: [
    {
      id: '1',
      type: 'a',
      app_id: 'a2',
      user_id: '1'
    },
    {
      id: '2',
      type: 'b',
      app_id: 'a2'
    }
  ]
};

export const schema: memory_db.Schema = {
  deployment: {
    scope_path: ['app', 'organization'],
    indexes: ['app_id']
  },
  organization: {
    scope_path: ['organization']
  },
  app: {
    scope_path: ['organization'],
    indexes: ['organization_id']
  },
  user: {
    scope_path: ['organization'],
    indexes: ['organization_id']
  },
  draft: {
    scope_path: ['app', 'organization'],
    indexes: ['app_id', 'user_id']
  }
};

export type TestCase = {
  name: string;
  model: string;
  statements: cardinal.PolicyStatement[];
  result: string[];

  speculative_data?: entity_resolver.SpeculativeData;

  entity_filter?: entity_resolver.EntityFilter;

  focus?: boolean;
};

export const test_cases: TestCase[] = [
  {
    name: 'should resolve to an empty list',
    model: 'app',
    statements: [],
    result: []
  },

  {
    name: 'simple scoped permissions',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'app',
              id: '*'
            }
          }
        ]
      }
    ],
    result: ['a2', 'a3']
  },
  {
    name: 'simple unscoped permissions',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            selector: {
              model: 'app',
              id: '*'
            }
          }
        ]
      }
    ],
    result: ['a1']
  },
  {
    name: 'specifically scoped permission',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: 'o1',
            selector: {
              model: 'app',
              id: '*'
            }
          }
        ]
      }
    ],
    result: ['a2']
  },
  {
    name: 'specific scoped id selector (should be empty due to scope)',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'app',
              id: 'a1'
            }
          }
        ]
      }
    ],
    result: []
  },
  {
    name: 'specific scoped id selector',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'app',
              id: 'a2'
            }
          }
        ]
      }
    ],
    result: ['a2']
  },

  {
    name: 'extended scope model: unscoped',
    model: 'deployment',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            selector: {
              model: 'deployment',
              id: '*'
            }
          }
        ]
      }
    ],
    result: ['d1']
  },

  {
    name: 'extended scope model: scoped [combination 1]',
    model: 'deployment',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: 'o1',
            selector: {
              model: 'deployment',
              id: '*'
            }
          }
        ]
      }
    ],
    result: ['d2', 'd3']
  },
  {
    name: 'extended scope model: scoped [combination 2]',
    model: 'deployment',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: 'o2',
            selector: {
              model: 'deployment',
              id: '*'
            }
          }
        ]
      }
    ],
    result: ['d4']
  },

  {
    name: 'simple label selectors with variance [combination 1]',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'app',
              labels: {
                a: 'b'
              }
            }
          }
        ]
      }
    ],
    result: ['a2']
  },
  {
    name: 'simple label selectors with variance [combination 2]',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'app',
              labels: {
                a: 'b',
                c: 'd'
              }
            }
          }
        ]
      }
    ],
    result: ['a2']
  },
  {
    name: 'simple label selectors with variance [combination 3]',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'app',
              labels: {
                e: 'f'
              }
            }
          }
        ]
      }
    ],
    result: ['a3']
  },
  {
    name: 'simple label selectors with variance [combination 4]',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'app',
              labels: {
                e: 'f',
                b: 'd'
              }
            }
          }
        ]
      }
    ],
    result: []
  },

  {
    name: 'permission with simple parent [combination 1]',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'app',
              id: '*',
              parents: [
                {
                  model: 'organization',
                  id: 'o1'
                }
              ]
            }
          }
        ]
      }
    ],
    result: ['a2']
  },
  {
    name: 'permission with simple parent [combination 2]',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'app',
              id: '*',
              parents: [
                {
                  model: 'organization',
                  labels: {
                    a: 'b'
                  }
                }
              ]
            }
          }
        ]
      },
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'app',
              id: '*',
              parents: [
                {
                  model: 'organization',
                  labels: {
                    e: 'f'
                  }
                }
              ]
            }
          }
        ]
      }
    ],
    result: ['a2', 'a3']
  },

  {
    name: 'permission with nested parent',
    model: 'deployment',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'deployment',
              id: '*',
              parents: [
                {
                  model: 'app',
                  id: '*',
                  parents: [
                    {
                      model: 'organization',
                      id: 'o2'
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    ],
    result: ['d4']
  },

  {
    name: 'permissions with deny effect',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'app',
              id: '*'
            }
          }
        ]
      },
      {
        actions: ['*'],
        effect: cardinal.PERMISSION_EFFECT.Deny,
        resources: [
          {
            scope: '*',
            selector: {
              model: 'app',
              id: 'a3'
            }
          }
        ]
      }
    ],
    result: ['a2']
  },

  {
    name: 'speculative query',
    speculative_data: {
      app: [
        {
          id: 'a4',
          organization_id: 'o1'
        },
        {
          id: 'a5',
          organization_id: 'o1'
        }
      ]
    },
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: 'o1',
            selector: {
              model: 'app',
              id: '*'
            }
          }
        ]
      }
    ],
    result: ['a2', 'a4', 'a5']
  },

  {
    name: 'with id entity filter [combination 1]',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'app',
              id: '*'
            }
          }
        ]
      }
    ],
    entity_filter: {
      id: ['a2']
    },
    result: ['a2']
  },
  {
    name: 'with id entity filter [combination 2]',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'app',
              id: '*'
            }
          }
        ]
      }
    ],
    entity_filter: {
      id: 'a3'
    },
    result: ['a3']
  },
  {
    name: 'with field entity filter',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'app',
              id: '*'
            }
          }
        ]
      }
    ],
    entity_filter: {
      organization_id: 'o1'
    },
    result: ['a2']
  },
  {
    name: 'with unindexed entity filter',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'app',
              id: '*'
            }
          }
        ]
      }
    ],
    entity_filter: {
      fake: 'anything'
    },
    result: []
  },

  {
    name: 'permission with $or model should pass',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: ['user', 'app'],
              id: 'a2'
            }
          }
        ]
      }
    ],
    result: ['a2']
  },
  {
    name: 'permission with $or model should not pass',
    model: 'not-app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: ['user', 'app'],
              id: 'a2'
            }
          }
        ]
      }
    ],
    result: []
  },
  {
    name: 'permission with $or id',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: '*',
            selector: {
              model: ['user', 'app'],
              id: ['a2', 'a3']
            }
          }
        ]
      }
    ],
    result: ['a2', 'a3']
  },
  {
    name: 'permission with $or scope',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: ['o2'],
            selector: {
              model: ['user', 'app'],
              id: '*'
            }
          }
        ]
      }
    ],
    result: ['a3']
  },
  {
    name: 'permission with $or labels',
    model: 'app',
    statements: [
      {
        actions: ['*'],
        resources: [
          {
            scope: ['*'],
            selector: {
              model: ['user', 'app'],
              labels: {
                a: ['n', 'b'],
                c: ['e', 'd']
              }
            }
          }
        ]
      }
    ],
    result: ['a2']
  },
  {
    name: 'permission with $or action',
    model: 'app',
    statements: [
      {
        actions: ['create', 'read'],
        resources: [
          {
            scope: ['*'],
            selector: {
              model: ['user', 'app'],
              labels: {
                a: ['n', 'b'],
                c: ['e', 'd']
              }
            }
          }
        ]
      }
    ],
    result: ['a2']
  },
  {
    name: 'permission with $or id in parent',
    model: 'app',
    statements: [
      {
        actions: ['create', 'read'],
        resources: [
          {
            scope: ['*'],
            selector: {
              model: ['user', 'app'],
              id: '*',
              parents: [
                {
                  model: 'organization',
                  id: ['o2', 'o3']
                }
              ]
            }
          }
        ]
      }
    ],
    result: ['a3']
  },

  {
    name: 'permission with multiple parents',
    model: 'draft',
    statements: [
      {
        actions: ['read'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'draft',
              id: '*',
              parents: [
                {
                  model: 'app',
                  id: 'a2'
                },
                {
                  model: 'user',
                  id: '1'
                }
              ]
            }
          }
        ]
      }
    ],
    result: ['1']
  },

  {
    name: 'permission with unknown parent models',
    model: 'draft',
    statements: [
      {
        actions: ['read'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'draft',
              id: '*',
              parents: [
                {
                  model: 'unknown',
                  id: '123'
                }
              ]
            }
          }
        ]
      }
    ],
    result: []
  },

  {
    name: 'permission with mismatched model',
    model: 'draft',
    statements: [
      {
        actions: ['read'],
        resources: [
          {
            scope: '*',
            selector: {
              model: 'app',
              id: '*'
            }
          }
        ]
      }
    ],
    result: []
  }
];
