import * as t from 'ts-codec';

export const V2GetUserAssignmentParams = t.object({
  user_id: t.string
});
export type V2GetUserAssignmentParams = t.Encoded<typeof V2GetUserAssignmentParams>;

export const V2UpdateUserPolicyAssignmentParams = t.object({
  user_id: t.string,
  policy_id: t.string
});
export type V2UpdateUserPolicyAssignmentParams = t.Encoded<typeof V2UpdateUserPolicyAssignmentParams>;

export const V2UpdateUserRoleAssignmentParams = t.object({
  user_id: t.string,
  role_id: t.string
});
export type V2UpdateUserRoleAssignmentParams = t.Encoded<typeof V2UpdateUserRoleAssignmentParams>;

export const V2GetPolicyAssignmentsParams = t.object({
  policy_id: t.string
});

export type V2GetPolicyAssignmentsParams = t.Encoded<typeof V2GetPolicyAssignmentsParams>;

export const V2GetPolicyAssignmentsResponse = t.object({
  user_ids: t.array(t.string),
  token_ids: t.array(t.string),
  role_ids: t.array(t.string)
});

export type V2GetPolicyAssignmentsResponse = t.Encoded<typeof V2GetPolicyAssignmentsResponse>;
