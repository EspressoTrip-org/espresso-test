import * as cardinal from '@journeyapps-platform/types-cardinal';
import { createOwnerPolicy } from '../owner';
import { createDeveloperPolicy } from '../developer';

export enum MANAGED_POLICY {
  OWNER = 'owner',
  DEVELOPER = 'developer',
  LOCKED = 'locked'
}

export type ManagedPolicyResponse = Record<MANAGED_POLICY.OWNER | MANAGED_POLICY.DEVELOPER, cardinal.Policy>;

export const createDefaultPoliciesForOrg = (org_id: string): ManagedPolicyResponse => {
  return {
    [MANAGED_POLICY.OWNER]: createOwnerPolicy(org_id),
    [MANAGED_POLICY.DEVELOPER]: createDeveloperPolicy(org_id)
  };
};

export type CreateDefaultRolesPolicyMap = Partial<Record<MANAGED_POLICY, string>>;

export const createDefaultRolesForOrg = (org_id: string, policies: CreateDefaultRolesPolicyMap) => {
  const owner_policy = policies[MANAGED_POLICY.OWNER];
  const owner_role: cardinal.Role = {
    name: cardinal.MANAGED_ROLE.OWNER,
    org_id: org_id,
    policy_ids: [owner_policy!]
  };

  const developer_policy = policies[MANAGED_POLICY.DEVELOPER];
  const developer_role: cardinal.Role = {
    name: cardinal.MANAGED_ROLE.DEVELOPER,
    org_id: org_id,
    policy_ids: [developer_policy!]
  };

  return [owner_role, developer_role];
};
