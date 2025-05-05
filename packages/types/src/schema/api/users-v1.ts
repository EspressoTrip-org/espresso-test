import * as defs from '../definitions';
import * as t from 'ts-codec';
import { PolicyResource, RoleResource } from '../definitions';

export const ListUserParams = t.object({
  org_id: t.string
});
export type ListUserParams = t.Encoded<typeof ListUserParams>;

export const GetUserParams = t.object({
  id: t.string
});
export type GetUserParams = t.Encoded<typeof GetUserParams>;

export const GetUserResponse = defs.UserResource.and(
  t.object({
    policies: t.array(PolicyResource),
    roles: t.array(RoleResource)
  })
);
export type GetUserResponse = t.Encoded<typeof GetUserResponse>;

export const UpdateUserAssignments = t.object({
  id: t.string,
  policy_ids: t.array(t.string).optional(),
  role_ids: t.array(t.string).optional()
});
export type UpdateUserAssignments = t.Encoded<typeof UpdateUserAssignments>;

export const UpdateUserPolicyAssignmentParams = t.object({
  id: t.string,
  policy_id: t.string
});
export type UpdateUserPolicyAssignmentParams = t.Encoded<typeof UpdateUserPolicyAssignmentParams>;

export const UpdateUserRoleAssignmentParams = t.object({
  id: t.string,
  role_id: t.string
});
export type UpdateUserRoleAssignmentParams = t.Encoded<typeof UpdateUserRoleAssignmentParams>;
