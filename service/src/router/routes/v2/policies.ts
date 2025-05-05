import * as micro from '@journeyapps-platform/micro';
import * as cardinal from '@journeyapps-platform/types-cardinal';
import { Router } from '../../router';
import * as auth from '../../../auth';
import * as api from '../../../api';

export const list_policies = Router.post(cardinal.ROUTES_V2.LIST_POLICIES, {
  validator: micro.schema.createTsCodecValidator(cardinal.V2ListResourceParams),
  handler: ({ params, context }) => {
    return api.policies.listPolicies(context.system, {
      ...params,
      policies: context.viewer.policies
    });
  }
});

export const create_scoped_policy = Router.post(cardinal.ROUTES_V2.CREATE_SCOPED_POLICY, {
  validator: micro.schema.createTsCodecValidator(cardinal.CreateScopedPolicyParams),
  authorize: auth.policies.authorizedToCreatePolicy,
  handler: ({ params, context }) => {
    return api.policies.createPolicy(context.system, {
      actor: context.viewer.actor,
      policy: params
    });
  }
});

export const create_unscoped_policy = Router.post(cardinal.ROUTES_V2.CREATE_UNSCOPED_POLICY, {
  validator: micro.schema.createTsCodecValidator(cardinal.CreateUnscopedPolicyParams),
  authorize: auth.policies.authorizedToCreatePolicy,
  handler: ({ params, context }) => {
    return api.policies.createPolicy(context.system, {
      actor: context.viewer.actor,
      policy: params
    });
  }
});

export const update_policy = Router.post(cardinal.ROUTES_V2.UPDATE_POLICY, {
  validator: micro.schema.createTsCodecValidator(cardinal.UpdatePolicyParams),
  authorize: auth.policies.authorizedToUpdatePolicy,
  handler: ({ params, context }) => {
    return api.policies.updatePolicy(context.system, {
      actor: context.viewer.actor,
      policy: params
    });
  }
});

export const delete_policy = Router.post(cardinal.ROUTES_V2.DELETE_POLICY, {
  validator: micro.schema.createTsCodecValidator(cardinal.DeletePolicyParams),
  authorize: auth.policies.authorizedToDeletePolicy,
  handler: async ({ params, context }) => {
    await api.policies.deletePolicy(context.system, {
      actor: context.viewer.actor,
      id: params.id
    });
    return true;
  }
});

export const routes = [list_policies, create_scoped_policy, create_unscoped_policy, delete_policy, update_policy];
