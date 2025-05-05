import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as t from 'ts-codec';

export const Document = t
  .object({
    id: t.string,
    labels: t.record(t.string).optional()
  })
  // the design of this type is supposed to accept any additional keys,
  // AND this is valid in ts-codec when encoding and decoding, but this
  // specifically will cause validation issues when converting to json-schema (for validation)
  // in places where this type is used, we need to add {allowAdditional: true } in the codec validators
  // in order to get this to work correctly.
  .and(t.record(t.any));
export type Document = t.Encoded<typeof Document>;

export const EntityFilter = t.record(t.string.or(t.array(t.string)));
export type EntityFilter = t.Encoded<typeof EntityFilter>;

export const SpeculativeData = t.record(t.array(Document));
export type SpeculativeData = t.Encoded<typeof SpeculativeData>;

export const ResolveResourceIdParams = t.object({
  actions: t.array(t.string).optional(),
  model: t.string,
  policies: t.array(cardinal.RawPolicy),
  entity_filter: EntityFilter.optional(),
  speculative_data: SpeculativeData.optional()
});
export type ResolveResourceIdParams = t.Encoded<typeof ResolveResourceIdParams>;

export const CanAccessResourceParams = t
  .omit(ResolveResourceIdParams, ['entity_filter'])
  .and(t.object({ id: t.string }));
export type CanAccessResourceParams = t.Encoded<typeof CanAccessResourceParams>;

export const InvalidateParams = t.object({
  model: t.string,
  ids: t.array(t.string).optional()
});
export type InvalidateParams = t.Encoded<typeof InvalidateParams>;

//---- Interfaces

export type EntityResolver = {
  resolveResourceIds: (params: ResolveResourceIdParams) => Promise<string[]>;
  canAccessResource: (params: CanAccessResourceParams) => Promise<boolean>;
  invalidate: (params: InvalidateParams) => Promise<void>;
  init: (models?: string[]) => Promise<void>;
};

export type ScopePath = string[];

export type ResourceDatabase = {
  resolveEntityIds: (
    model: string,
    statements: cardinal.PolicyStatement[],
    entity_filter?: EntityFilter
  ) => Promise<string[]>;
  transact: (model: string, docs: Document[]) => Promise<void>;
  redact: (model: string, ids: string[]) => Promise<void>;
  speculate: (data: SpeculativeData) => Promise<ResourceDatabase>;
};

export type ResourceDatabaseCache = {
  get: (key: string) => Promise<string[] | null>;
  set: (key: string, value: string[]) => Promise<void>;
  invalidate: (keys?: string[]) => Promise<void>;
};

export type ResourceProvider = {
  models: string[];
  fetch: (model: string, ids?: string[]) => Promise<Document[]>;
};
