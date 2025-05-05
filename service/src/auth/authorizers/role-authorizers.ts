import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro from '@journeyapps-platform/micro';
import * as compilation from '../../api/compilation';
import * as errors from '../../errors';
import { Context } from '../context';
import * as api from '../../api';
import * as bson from 'bson';
import { CardinalModel, RoleModelAction } from '@journeyapps-platform/cardinal-catalog';

export const authorizedForRoleAssignedPolicies: micro.router.EndpointAuthorizer<cardinal.Role, Context> = async ({
  params,
  context
}) => {
  const policies = await api.policies.getPoliciesByIds(context.system.mongo, params.policy_ids || []);
  const all_scoped_correctly = policies.reduce((all_match, policy) => {
    if (!all_match) {
      return false;
    }
    return !!policy.org_id && policy.org_id === params.org_id;
  }, true);
  if (!all_scoped_correctly) {
    return {
      authorized: false,
      errors: ['all policies scopes need to match the roles scope', context.viewer.errors]
    };
  }

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
      cardinal.requireMatchingScope(params.org_id),
      cardinal.canAssignPermission(context.viewer.permissions)
    ),
    errors: ['you cannot assign policies higher than your own', context.viewer.errors]
  };
};

export const authorizedToCreateRole: micro.router.EndpointAuthorizer<cardinal.Role, Context> = async ({
  params,
  context
}) => {
  const id = new bson.ObjectId().toHexString();
  const can_create = await context.viewer.can(RoleModelAction.CREATE, CardinalModel.ROLE, id, {
    role: [
      {
        id: id,
        organization_id: params.org_id
      }
    ]
  });
  if (!can_create.authorized) {
    return can_create;
  }
  return authorizedForRoleAssignedPolicies({ params, context });
};

export const authorizedToUpdateRole: micro.router.EndpointAuthorizer<
  micro.db.SerializedId & Omit<cardinal.Role, 'org_id'>,
  Context
> = async ({ params, context }) => {
  const role = await api.roles.getRole(context.system.mongo, params.id);
  if (role.managed) {
    throw new errors.ManagedResourceError(role.id);
  }

  const can_update = await context.viewer.can(RoleModelAction.UPDATE, CardinalModel.ROLE, role.id);
  if (!can_update.authorized) {
    return can_update;
  }

  return authorizedForRoleAssignedPolicies({
    params: {
      ...params,
      org_id: role.org_id
    },
    context
  });
};
