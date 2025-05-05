import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as compilation from '../../api/compilation';
import * as micro from '@journeyapps-platform/micro';
import * as errors from '../../errors';
import { Context } from '../context';
import * as api from '../../api';
import * as bson from 'bson';
import { CardinalModel, PolicyModelAction } from '@journeyapps-platform/cardinal-catalog';

export const authorizedForPolicyStatements: micro.router.EndpointAuthorizer<cardinal.Policy, Context> = async ({
  params,
  context
}) => {
  const permissions = cardinal.createPermissionsFromPolicy(
    compilation.interpolateTemplatePolicy(params, {
      actor: context.viewer.claim?.actor
    })
  );

  const errors = ['unauthorized to create/assign policies higher than your own', ...(context.viewer.errors || [])];

  if (params.org_id) {
    return {
      authorized: cardinal.allPermissionsSatisfyAllFilters(
        permissions,
        cardinal.requireMatchingScope(params.org_id),
        cardinal.canAssignPermission(context.viewer.permissions)
      ),
      errors: errors
    };
  }

  return {
    authorized: cardinal.allPermissionsSatisfyAllFilters(
      permissions,
      cardinal.canAssignPermission(context.viewer.permissions)
    ),
    errors
  };
};

export const authorizedToCreatePolicy: micro.router.EndpointAuthorizer<cardinal.Policy, Context> = async ({
  params,
  context
}) => {
  const id = new bson.ObjectId().toHexString();
  const can_create = await context.viewer.can(PolicyModelAction.CREATE, CardinalModel.POLICY, id, {
    policy: [
      {
        id: id,
        organization_id: params.org_id
      }
    ]
  });
  if (!can_create.authorized) {
    return can_create;
  }

  return authorizedForPolicyStatements({ params, context });
};

export const authorizedToUpdatePolicy: micro.router.EndpointAuthorizer<
  micro.db.SerializedId & Omit<cardinal.Policy, 'org_id'>,
  Context
> = async ({ params, context }) => {
  const policy = await api.policies.getPolicy(context.system.mongo, params.id);
  if (policy.managed) {
    throw new errors.ManagedResourceError(policy.id);
  }

  const can_update = await context.viewer.can(PolicyModelAction.UPDATE, CardinalModel.POLICY, policy.id);

  if (!can_update.authorized) {
    return can_update;
  }
  return authorizedForPolicyStatements({
    params: {
      ...params,
      org_id: policy.org_id
    },
    context
  });
};

export const authorizedToDeletePolicy: micro.router.EndpointAuthorizer<{ id: string }, Context> = async ({
  params,
  context
}) => {
  const policy = await api.policies.getPolicy(context.system.mongo, params.id);
  if (policy.managed) {
    throw new errors.ManagedResourceError(policy.id);
  }

  return context.viewer.can('delete', CardinalModel.POLICY, policy.id);
};
