import * as entity_resolver from '@journeyapps-platform/recon-entity-resolver';

export type MapSubset<K, V> = {
  delete(key: K): void;
  forEach(cb: (value: V, key: K) => void): void;
  get(key: K): V | undefined;
  has(key: K): boolean;
  set(key: K, value: V): void;

  toNativeMap?: () => Map<K, V>;
};

export type DocumentStore = MapSubset<string, entity_resolver.Document>;
export type DocumentStores = Record<string, DocumentStore>;

export type IndexStore = MapSubset<string, Set<string>>;
export type IndexStores = Record<string, IndexStore>;

export type ModelSchema = {
  scope_path: entity_resolver.ScopePath;
  indexes?: string[];
};
export type Schema = Record<string, ModelSchema>;

export type DB = {
  document_stores: DocumentStores;
  index_stores: IndexStores;
  schema: Partial<Schema>;
};
