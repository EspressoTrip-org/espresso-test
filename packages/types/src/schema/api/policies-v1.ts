import * as defs from '../definitions';
import { Policy, Scoped, UnscopedPolicy } from '../definitions';
import * as t from 'ts-codec';
import { ResourceId } from '@journeyapps-platform/micro-codecs';

export const ListScopedPolicyParams = t.object({
  org_id: t.string
});
export type ListScopedPolicyParams = t.Encoded<typeof ListScopedPolicyParams>;

export const CreateUnscopedPolicyParams = UnscopedPolicy;
export type CreateUnscopedPolicyParams = t.Encoded<typeof CreateUnscopedPolicyParams>;

export const CreateScopedPolicyParams = Policy.and(Scoped);
export type CreateScopedPolicyParams = t.Encoded<typeof CreateScopedPolicyParams>;

export const GetPolicyAssignments = t.object({
  id: t.string
});
export type GetPolicyAssignments = t.Encoded<typeof GetPolicyAssignments>;

export const DeletePolicyParams = t.object({
  id: t.string
});
export type DeletePolicyParams = t.Encoded<typeof DeletePolicyParams>;

export const UpdatePolicyParams = defs.UnscopedPolicy.and(ResourceId);
export type UpdatePolicyParams = t.Encoded<typeof UpdatePolicyParams>;
