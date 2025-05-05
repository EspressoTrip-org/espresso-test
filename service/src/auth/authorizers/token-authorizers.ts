import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro from '@journeyapps-platform/micro';
import * as compilation from '../../api/compilation';
import { Context } from '../context';
import * as api from '../../api';
import * as bson from 'bson';
import { ObjectId } from 'bson';
import { CardinalModel, TokenModelAction } from '@journeyapps-platform/cardinal-catalog';

const policiesMatchScopeCategory = (policies: cardinal.Policy[], scope: false | string) => {
  return policies.reduce((all_match, policy) => {
    if (!all_match) {
      return false;
    }
    if (!scope) {
      return !policy.org_id;
    }
    return !!policy.org_id && policy.org_id === scope;
  }, true);
};

export const checkTokenPolicyPermissions: micro.router.EndpointAuthorizer<
  cardinal.TokenWithoutValue,
  Context
> = async ({ params, context }) => {
  const policies = await api.policies.getPoliciesByIds(context.system.mongo, params.policy_ids || []);

  const policy_permissions = cardinal.createPermissionsFromPolicies(
    policies.map((policy) =>
      compilation.interpolateTemplatePolicy(policy, {
        actor: context.viewer.claim?.actor
      })
    )
  );
  return {
    authorized: cardinal.allPermissionsSatisfyAllFilters(
      policy_permissions,
      cardinal.canAssignPermission(context.viewer.permissions)
    ),
    errors: ['cannot assign policies you do not have', context.viewer.errors]
  };
};

export const authorizedForTokenAssignedPolicies: micro.router.EndpointAuthorizer<
  cardinal.TokenWithoutValue,
  Context
> = async ({ params, context }) => {
  const policies = await api.policies.getPoliciesByIds(context.system.mongo, params.policy_ids || []);
  if (params.org_id) {
    const all_scoped = policiesMatchScopeCategory(policies, params.org_id);
    if (!all_scoped) {
      return {
        authorized: false,
        errors: ['all policies need to be scoped', context.viewer.errors]
      };
    }
  } else {
    const all_unscoped = policiesMatchScopeCategory(policies, false);
    if (!all_unscoped) {
      return {
        authorized: false,
        errors: ['all policies need to be unscoped', context.viewer.errors]
      };
    }
  }

  return await checkTokenPolicyPermissions({ params, context });
};

export const authorizedToCreateToken: micro.router.EndpointAuthorizer<cardinal.TokenWithoutValue, Context> = async ({
  params,
  context
}) => {
  const id = new bson.ObjectId().toHexString();
  const can_create = await context.viewer.can(TokenModelAction.CREATE, CardinalModel.TOKEN, id, {
    token: [
      {
        id: id,
        organization_id: params.org_id
      }
    ]
  });
  if (!can_create.authorized) {
    return can_create;
  }
  return authorizedForTokenAssignedPolicies({ params, context });
};

export const authorizedToCreatePAT: micro.router.EndpointAuthorizer<
  cardinal.CreatePersonalTokenParams,
  Context
> = async ({ params, context }) => {
  const id = new bson.ObjectId().toHexString();
  const user = await context.system.mongo.users.findOne({ _id: new ObjectId(params.user_id) });
  if (!user) {
    return {
      authorized: false,
      errors: []
    };
  }
  const can_create = await context.viewer.can(TokenModelAction.CREATE, CardinalModel.TOKEN, id, {
    token: [
      {
        id: id,
        organization_id: user.org_id,
        labels: {
          user_id: params.user_id
        }
      }
    ]
  });
  if (!can_create.authorized) {
    return can_create;
  }

  return checkTokenPolicyPermissions({
    params: {
      ...params,
      org_id: user.org_id
    },
    context
  });
};

export const authorizedToUpdateToken: micro.router.EndpointAuthorizer<
  micro.db.SerializedId & Omit<cardinal.TokenWithoutValue, 'org_id'>,
  Context
> = async ({ params, context }) => {
  const token = await api.tokens.getToken(context.system.mongo, params.id);

  const can_update = await context.viewer.can(TokenModelAction.UPDATE, CardinalModel.TOKEN, token.id);
  if (!can_update.authorized) {
    return can_update;
  }
  return authorizedForTokenAssignedPolicies({
    params: {
      ...params,
      org_id: token.org_id
    },
    context
  });
};
