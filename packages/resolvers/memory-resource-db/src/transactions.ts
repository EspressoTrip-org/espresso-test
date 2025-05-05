import * as entity_resolver from '@journeyapps-platform/recon-entity-resolver';
import * as clone from './referential-clone';
import * as defs from './definitions';
import * as _ from 'lodash';

export const getIndexKey = (model: string, field: string) => {
  return `${model}_${field}`;
};

type ModifyIndexMappingParams = {
  doc: entity_resolver.Document;
  field: string;
  model: string;
  handler: (mapping: Set<string>) => void;
};
const modifyIndexMapping = (db: defs.DB, params: ModifyIndexMappingParams) => {
  const value = params.doc[params.field];
  if (!value) {
    return;
  }

  const key = getIndexKey(params.model, params.field);
  if (!db.index_stores[key]) {
    db.index_stores[key] = new Map();
  }
  const index_store = db.index_stores[key];

  // We clone the index mapping at mutation time to prevent speculative queries from
  // modifying existing data. We could also do this when speculating (when we clone)
  // except that that would significantly slow down the speculation API
  const mapping = new Set<string>(index_store.get(value) || new Set());
  index_store.set(value, mapping);

  params.handler(mapping);
};

export type TransactionParams = {
  model: string;
  documents: entity_resolver.Document[];
};
export const transact = (db: defs.DB, params: TransactionParams) => {
  if (!db.document_stores[params.model]) {
    db.document_stores[params.model] = new Map();
  }

  const document_store = db.document_stores[params.model];
  const schema = db.schema[params.model];

  for (const doc of params.documents) {
    const original = document_store.get(doc.id);
    document_store.set(doc.id, doc);

    // Update any declared indexes for this document
    for (const field of schema?.indexes || []) {
      modifyIndexMapping(db, {
        field,
        doc,
        model: params.model,
        handler: (mapping) => {
          mapping.add(doc.id);
        }
      });

      // If we originally had a document in the store and the indexed field has changed
      // then we need to remove the old mapping
      if (original && original[field] !== doc[field]) {
        modifyIndexMapping(db, {
          field,
          doc: original,
          model: params.model,
          handler: (mapping) => {
            mapping.delete(doc.id);
          }
        });
      }
    }
  }
};

type RedactionParams = {
  model: string;
  ids: string[];
};
export const redact = (db: defs.DB, params: RedactionParams) => {
  const document_store = db.document_stores[params.model];
  if (!document_store) {
    return;
  }

  const schema = db.schema[params.model];
  for (const id of params.ids) {
    const doc = document_store.get(id);
    if (!doc) {
      continue;
    }

    document_store.delete(id);

    // Remove index mappings for deleted document
    for (const field of schema?.indexes || []) {
      modifyIndexMapping(db, {
        field,
        doc,
        model: params.model,
        handler: (mapping) => {
          mapping.delete(doc.id);
        }
      });
    }
  }
};

const cloneStores = <K, V>(stores: Record<string, defs.MapSubset<K, V>>) => {
  return _.mapValues(stores, (store) => {
    return clone.referentialDiffClone(store);
  });
};

export const speculate = (db: defs.DB, data: Record<string, entity_resolver.Document[]>) => {
  const speculative_db = {
    schema: db.schema,
    document_stores: cloneStores(db.document_stores),
    index_stores: cloneStores(db.index_stores)
  };

  for (const model of Object.keys(data)) {
    transact(speculative_db, {
      model: model,
      documents: data[model]
    });
  }

  return speculative_db;
};
