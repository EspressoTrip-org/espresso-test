import * as entity_resolver from '@journeyapps-platform/recon-entity-resolver';
import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as transactions from './transactions';
import * as defs from './definitions';

const matchesOne = <T>(items: T[], match: (item: T) => boolean) => {
  for (const item of items) {
    if (match(item)) {
      return true;
    }
  }
  return false;
};

const resolveResourceFromScope = (
  db: defs.DB,
  resource: entity_resolver.Document,
  scope_path: entity_resolver.ScopePath
) => {
  if (scope_path.length === 0) {
    return;
  }
  return scope_path.reduce((resource: entity_resolver.Document | undefined | string, model, i) => {
    if (typeof resource !== 'object') {
      return resource;
    }
    const ref = resource[`${model}_id`];
    if (i == scope_path.length - 1) {
      return ref;
    }
    if (ref) {
      return db.document_stores[model]?.get(ref);
    }
  }, resource);
};

const compareScope = (scope?: cardinal.StringOr, parent?: string) => {
  if (scope) {
    if (!parent) {
      return false;
    }
    if (!cardinal.compareWithWildcards(scope, parent)) {
      return false;
    }
  } else {
    if (parent) {
      return false;
    }
  }
  return true;
};

const compareSelectors = (selector: cardinal.ResourceSelector, document: entity_resolver.Document) => {
  if (cardinal.isIDResourceSelector(selector)) {
    if (!cardinal.compareWithWildcards(selector.id, document.id)) {
      return false;
    }
  } else {
    if (!cardinal.compareLabels(selector.labels, document.labels || {})) {
      return false;
    }
  }

  return true;
};

const compareParents = (db: defs.DB, parents: cardinal.ResourceSelector[], child: entity_resolver.Document) => {
  return cardinal.reduce(
    parents,
    (acc, selector, reduced) => {
      const document = cardinal.reduce(
        cardinal.castToArray(selector.model),
        (acc, model, reduced) => {
          const document = db.document_stores[model]?.get(child[`${model}_id`]);

          if (!document) {
            return false;
          }
          if (!compareSelectors(selector, document)) {
            return false;
          }
          if (selector.parents && selector.parents.length > 0) {
            if (!compareParents(db, selector.parents, document)) {
              return false;
            }
          }

          return reduced(true);
        },
        false
      );

      if (!document) {
        return reduced(false);
      }
      return true;
    },
    true
  );
};

type FilterStoreParams = {
  model: string;
  statements: cardinal.PolicyStatement[];
  db: defs.DB;
};
const filterStoreByPermissions = (store: defs.DocumentStore, params: FilterStoreParams) => {
  const schema = params.db.schema[params.model];

  const ids: string[] = [];
  store.forEach((doc) => {
    const parent = resolveResourceFromScope(params.db, doc, schema?.scope_path || []);

    const accepted = cardinal.reduce(
      params.statements,
      (_, statement, reduced) => {
        const resource_match = cardinal.reduce(
          statement.resources,
          (_, resource, reduced) => {
            if (!cardinal.compareWithWildcards(resource.selector.model, params.model)) {
              return false;
            }

            if (!compareScope(resource.scope, parent as string)) {
              return false;
            }

            if (!compareSelectors(resource.selector, doc)) {
              return false;
            }

            if (resource.selector.parents && resource.selector.parents.length > 0) {
              if (!compareParents(params.db, resource.selector.parents, doc)) {
                return false;
              }
            }

            return reduced(true);
          },
          false
        );

        if (resource_match) {
          if (statement.effect && statement.effect === cardinal.PERMISSION_EFFECT.Deny) {
            return reduced(false);
          }
          return reduced(true);
        }

        return false;
      },
      false
    );

    if (accepted) {
      ids.push(doc.id);
    }
  });

  return ids;
};

type CreatePartialStoreParams = {
  entity_filter: entity_resolver.EntityFilter;
  store: defs.DocumentStore;
  model: string;
};
export const createPartialStoreFromIndexes = (db: defs.DB, params: CreatePartialStoreParams) => {
  const ids = [];

  const { id, ...filter } = params.entity_filter;
  if (id) {
    ids.push(...(Array.isArray(id) ? id : [id]));
  }

  for (const attr of Object.keys(filter)) {
    const key = transactions.getIndexKey(params.model, attr);
    const index_store = db.index_stores[key];
    if (!index_store) {
      continue;
    }

    const value = filter[attr];
    const normalized = Array.isArray(value) ? value : [value];

    for (const value of normalized) {
      const mapping = index_store.get(value);
      if (mapping) {
        ids.push(...mapping);
      }
    }
  }

  const partial_store = new Map();

  // We translate into a set to remove duplicate ids
  new Set(ids).forEach((id) => {
    const document = params.store.get(id);
    if (document) {
      partial_store.set(id, document);
    }
  });

  return partial_store;
};

/**
 * Deny permissions come before Allow
 */
const sortByEffect = (a: cardinal.PolicyStatement, b: cardinal.PolicyStatement) => {
  if (a.effect === cardinal.PERMISSION_EFFECT.Deny) {
    return -1;
  }
  if (b.effect === cardinal.PERMISSION_EFFECT.Deny) {
    return 1;
  }
  return 0;
};

export type QueryParams = {
  model: string;
  statements: cardinal.PolicyStatement[];
  entity_filter?: entity_resolver.EntityFilter;
};
export const query = (db: defs.DB, params: QueryParams) => {
  let store = db.document_stores[params.model];
  if (!store) {
    return [];
  }

  // If an entity filter has been provided for this query then we produce a new partial document
  // store from index lookups. Any limiting attributes in the entity_filter _must_ be indexed
  if (Object.keys(params.entity_filter || {}).length > 0) {
    store = createPartialStoreFromIndexes(db, {
      entity_filter: params.entity_filter!,
      model: params.model,
      store: store
    });
  }

  // Sort permissions such that permissions with a Deny effect appear first. This is done due
  // to the nature of the store filter wherein it will return early on the first matching
  // permission and Deny permissions take priority over Allow
  const sorted_statements = params.statements.sort(sortByEffect);

  return filterStoreByPermissions(store, {
    db: db,
    model: params.model,
    statements: sorted_statements
  });
};
