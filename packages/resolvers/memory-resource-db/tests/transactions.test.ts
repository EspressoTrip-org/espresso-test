import { describe, test, expect } from 'vitest';

import * as memory_db from '../src';

describe('transactions', () => {
  test('documents should be correctly added to store', () => {
    const db: memory_db.DB = {
      document_stores: {},
      index_stores: {},
      schema: {}
    };

    memory_db.transact(db, {
      model: 'a',
      documents: [
        {
          id: '1'
        }
      ]
    });

    expect(db.document_stores.a).toEqual(new Map([['1', { id: '1' }]]));

    memory_db.transact(db, {
      model: 'a',
      documents: [
        {
          id: '1',
          field: 'b'
        },
        {
          id: '2',
          field: 'c'
        }
      ]
    });

    expect(db.document_stores.a).toEqual(
      new Map([
        ['1', { id: '1', field: 'b' }],
        ['2', { id: '2', field: 'c' }]
      ])
    );
  });

  test('documents should be correctly removed from store', () => {
    const db: memory_db.DB = {
      document_stores: {},
      index_stores: {},
      schema: {}
    };

    memory_db.transact(db, {
      model: 'a',
      documents: [
        {
          id: '1'
        }
      ]
    });

    expect(db.document_stores.a).toEqual(new Map([['1', { id: '1' }]]));

    memory_db.redact(db, {
      model: 'a',
      ids: ['1']
    });

    expect(db.document_stores.a).toEqual(new Map([]));
  });

  test('indexes should be correctly added and removed during a transaction', () => {
    const db: memory_db.DB = {
      document_stores: {},
      index_stores: {},
      schema: {
        a: {
          scope_path: ['field1'],
          indexes: ['field1']
        }
      }
    };

    memory_db.transact(db, {
      model: 'a',
      documents: [
        {
          id: '1',
          field1: 'b'
        }
      ]
    });

    expect(db.index_stores.a_field1.get('b')).toEqual(new Set(['1']));

    memory_db.transact(db, {
      model: 'a',
      documents: [
        {
          id: '2',
          field1: 'b'
        }
      ]
    });

    expect(db.index_stores.a_field1.get('b')).toEqual(new Set(['1', '2']));

    // Modifying a document which already exists in the DB, changing an indexed field. This should
    // result in the original index mapping being removed
    memory_db.transact(db, {
      model: 'a',
      documents: [
        {
          id: '1',
          field1: 'c'
        }
      ]
    });

    expect(db.index_stores.a_field1.get('b')).toEqual(new Set(['2']));
    expect(db.index_stores.a_field1.get('c')).toEqual(new Set(['1']));

    memory_db.redact(db, {
      model: 'a',
      ids: ['1']
    });

    expect(db.index_stores.a_field1.get('c')).toEqual(new Set([]));
  });
});
