import { describe, test, it, expect } from 'vitest';

import * as fixtures from './fixtures';
import * as memory_db from '../src';

const db: memory_db.DB = {
  document_stores: {},
  index_stores: {},
  schema: fixtures.schema
};

for (const model of Object.keys(fixtures.seed_data)) {
  memory_db.transact(db, {
    model,
    documents: fixtures.seed_data[model]
  });
}

describe('queries', () => {
  for (const fixture of fixtures.test_cases) {
    const fn = fixture.focus ? it.only : test;
    fn(fixture.name, () => {
      let _db = db;
      if (fixture.speculative_data) {
        _db = memory_db.speculate(db, fixture.speculative_data);
      }

      expect(
        memory_db.query(_db, {
          model: fixture.model,
          statements: fixture.statements,
          entity_filter: fixture.entity_filter
        })
      ).toEqual(fixture.result);
    });
  }

  // Reproduce case where local database is missing app data and resource resolution throws an error
  it('should not throw error when querying missing models', () => {
    const db: memory_db.DB = {
      document_stores: {},
      index_stores: {},
      schema: {
        a: {
          scope_path: ['b', 'c'],
          indexes: ['b_id']
        },
        b: {
          scope_path: ['c'],
          indexes: ['c_id']
        },
        c: {
          scope_path: []
        }
      }
    };

    memory_db.transact(db, {
      model: 'a',
      documents: [
        {
          id: '123',
          b_id: '124'
        }
      ]
    });

    expect(
      memory_db.query(db, {
        model: 'a',
        statements: [
          {
            actions: ['*'],
            resources: [
              {
                selector: {
                  id: '*',
                  model: '*'
                },
                scope: '*'
              }
            ]
          }
        ]
      })
    ).toEqual([]);
  });
});
