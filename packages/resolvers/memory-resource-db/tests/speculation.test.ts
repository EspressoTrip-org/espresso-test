import { describe, test, expect } from 'vitest';

import * as memory_db from '../src';

describe('speculation', () => {
  test('creating a speculative database does not impact source', () => {
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
        },
        {
          id: '2',
          field1: 'c'
        }
      ]
    });

    const original_document_store = new Map([
      ['1', { id: '1', field1: 'b' }],
      ['2', { id: '2', field1: 'c' }]
    ]);
    const original_index_store = new Map([
      ['b', new Set(['1'])],
      ['c', new Set(['2'])]
    ]);

    expect(db.document_stores.a).toEqual(original_document_store);
    expect(db.index_stores.a_field1).toEqual(original_index_store);

    const speculative_db = memory_db.speculate(db, {
      a: [
        {
          id: '1',
          field1: 'c'
        },
        {
          id: '3',
          field1: 'd'
        },
        {
          id: '4',
          field1: 'b'
        }
      ]
    });

    expect(db.document_stores.a).toEqual(original_document_store);
    expect(db.index_stores.a_field1).toEqual(original_index_store);

    const speculative_document_store = new Map([
      ['1', { id: '1', field1: 'c' }],
      ['2', { id: '2', field1: 'c' }],
      ['3', { id: '3', field1: 'd' }],
      ['4', { id: '4', field1: 'b' }]
    ]);
    const speculative_index_store = new Map([
      ['b', new Set(['4'])],
      ['c', new Set(['2', '1'])],
      ['d', new Set(['3'])]
    ]);

    expect(speculative_db.document_stores.a.toNativeMap?.()).toEqual(speculative_document_store);
    expect(speculative_db.index_stores.a_field1.toNativeMap?.()).toEqual(speculative_index_store);
  });
});
