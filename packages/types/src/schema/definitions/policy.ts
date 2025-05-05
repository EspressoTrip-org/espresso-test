import * as permissions from './permission';
import { Managed, Scoped } from './generics';
import * as t from 'ts-codec';
import { Resource } from '@journeyapps-platform/micro-codecs';

export const PolicyStatement = t.object({
  actions: t.array(t.string),
  effect: t.Enum(permissions.PERMISSION_EFFECT).optional(),
  resources: t.array(permissions.Resource)
});
export type PolicyStatement = t.Encoded<typeof PolicyStatement>;

export const RawPolicy = t.object({
  statements: t.array(PolicyStatement)
});
export type RawPolicy = t.Encoded<typeof RawPolicy>;

export const Policy = Managed.and(
  RawPolicy.and(
    t.object({
      name: t.string.optional(),
      description: t.string.optional(),
      org_id: t.string.optional()
    })
  )
);
export type Policy = t.Encoded<typeof Policy>;

export const UnscopedPolicy = t.omit(Policy, ['org_id']);
export type UnscopedPolicy = t.Encoded<typeof UnscopedPolicy>;

export const PolicyResource = Resource.and(Policy);
export type PolicyResource = t.Decoded<typeof PolicyResource>;
export type SerializedPolicyResource = t.Encoded<typeof PolicyResource>;

export const ScopedPolicyResource = PolicyResource.and(Scoped);
export type ScopedPolicyResource = t.Decoded<typeof ScopedPolicyResource>;
export type SerializedScopedPolicyResource = t.Encoded<typeof ScopedPolicyResource>;

export const UnscopedPolicyResource = Resource.and(UnscopedPolicy);
export type UnscopedPolicyResource = t.Decoded<typeof UnscopedPolicyResource>;
export type SerializedUnscopedPolicyResource = t.Encoded<typeof UnscopedPolicyResource>;
