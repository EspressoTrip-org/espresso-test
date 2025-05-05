import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro from '@journeyapps-platform/micro';
import * as compilation from '../../api/compilation';
import { Context } from '../context';
import * as api from '../../api';
import { CardinalModel, UserModelAction } from '@journeyapps-platform/cardinal-catalog';

export const authorizedToUpdateUserPolicyAssociation: micro.router.EndpointAuthorizer<
  cardinal.UpdateUserPolicyAssignmentParams,
  Context
> = async ({ params, context }) => {
  const user = await api.users.getUser(context.system.mongo, params.id);

  const can_managed_assignments = await context.viewer.can(
    UserModelAction.MANAGE_ASSIGNMENTS,
    CardinalModel.USER,
    user.id
  );
  if (!can_managed_assignments.authorized) {
    return can_managed_assignments;
  }

  const errors = ['unauthorized to assign policies higher than your own', ...(context.viewer.errors || [])];

  const policy = await api.policies.getPolicy(context.system.mongo, params.policy_id);
  const permissions = cardinal.createPermissionsFromPolicy(
    compilation.interpolateTemplatePolicy(policy, {
      actor: context.viewer.claim?.actor
    })
  );

  return {
    authorized: cardinal.allPermissionsSatisfyAllFilters(
      permissions,
      cardinal.canAssignPermission(context.viewer.permissions)
    ),
    errors: errors
  };
};

export const authorizedToUpdateUserRoleAssociation: micro.router.EndpointAuthorizer<
  cardinal.UpdateUserRoleAssignmentParams,
  Context
> = async ({ params, context }) => {
  const user = await api.users.getUser(context.system.mongo, params.id);

  const { org_id: users_parent_org_id } = user;
  const role = await api.roles.getRole(context.system.mongo, params.role_id);

  /**
   * `manage-assignments` has a lot of power which currently gives users the
   *  ability to assign both roles and policies (scoped and unscoped for policies).
   *  In order to avoid issues as mentioned in:
   *    https://github.com/journeyapps-platform/cardinal/pull/25
   *  We can limit Owner users to only being able to assign roles scoped to the associated
   *  org. This introduces a limited action `manage-org-role-assignments`. We also
   *  limit the role to have to belong to the same org as the user being assigned to.
   *    Assigning roles from external orgs is handled via the Developer invite system.
   *    While support users such as Customer Success can still freely `manage-assignments`.
   */

  const can_manage_assignments = await context.viewer.can(
    UserModelAction.MANAGE_ASSIGNMENTS,
    CardinalModel.USER,
    user.id
  );
  const can_manage_org_roles = await context.viewer.can(
    UserModelAction.MANAGE_ORG_ROLE_ASSIGNMENTS,
    CardinalModel.USER,
    user.id
  );
  const role_belongs_to_same_org = role.org_id == users_parent_org_id;

  // can_manage_assignments.authorized => allow
  // can_manage_org_roles.authorized && role_belongs_to_same_org  => allow
  // CAVEAT: The failure message from 'can_manage_assignments' is deliberately squashed in favor of the one from can_manage_org_roles
  if (can_manage_assignments.authorized) {
    // allow everything (customer support role)
  } else if (!can_manage_org_roles.authorized) {
    return can_manage_org_roles;
  } else if (!role_belongs_to_same_org) {
    return {
      authorized: false,
      errors: ['Role does not belong to same org as user']
    };
  } else {
    // allowed
  }

  const errors = ['unauthorized to assign policies higher than your own', ...(context.viewer.errors || [])];
  const policies = await api.policies.getPoliciesByIds(context.system.mongo, role.policy_ids || []);

  const permissions = cardinal.createPermissionsFromPolicies(
    policies.map((policy) =>
      compilation.interpolateTemplatePolicy(policy, {
        actor: context.viewer.claim?.actor
      })
    )
  );

  return {
    authorized: cardinal.allPermissionsSatisfyAllFilters(
      permissions,
      cardinal.canAssignPermission(context.viewer.permissions)
    ),
    errors: errors
  };
};

export const authorizedToUpdateUserAssociations: micro.router.EndpointAuthorizer<
  cardinal.UpdateUserAssignments,
  Context
> = async ({ params, context }) => {
  const user = await api.users.getUser(context.system.mongo, params.id);

  const can_manage_assignments = await context.viewer.can(
    UserModelAction.MANAGE_ASSIGNMENTS,
    CardinalModel.USER,
    user.id
  );
  if (!can_manage_assignments.authorized) {
    return can_manage_assignments;
  }

  const roles = await api.roles.getRoles(context.system.mongo, params.role_ids || []);
  const policy_ids = roles.reduce((policy_ids: string[], role) => {
    return policy_ids.concat(role.policy_ids || []);
  }, params.policy_ids || []);
  const policies = await api.policies.getPoliciesByIds(context.system.mongo, policy_ids);

  const permissions = cardinal.createPermissionsFromPolicies(
    policies.map((policy) =>
      compilation.interpolateTemplatePolicy(policy, {
        actor: context.viewer.claim?.actor
      })
    )
  );

  const errors = ['unauthorized to assign policies higher than your own', ...(context.viewer.errors || [])];

  return {
    authorized: cardinal.allPermissionsSatisfyAllFilters(
      permissions,
      cardinal.canAssignPermission(context.viewer.permissions)
    ),
    errors: errors
  };
};
