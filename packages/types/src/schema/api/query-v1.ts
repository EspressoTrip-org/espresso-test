import { Policy, PolicyResource } from '../definitions';
import * as t from 'ts-codec';

export const QueryPoliciesForUser = t.object({
  user_id: t.string
});
export type QueryPoliciesForUser = t.Encoded<typeof QueryPoliciesForUser>;

export const QueryPoliciesForToken = t.object({
  token: t.string
});
export type QueryPoliciesForToken = t.Encoded<typeof QueryPoliciesForToken>;

export const PolicyQueryResponse = t.array(Policy.or(PolicyResource));
export type PolicyQueryResponse = t.Encoded<typeof PolicyQueryResponse>;
