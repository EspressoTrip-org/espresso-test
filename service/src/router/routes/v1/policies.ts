import * as micro from '@journeyapps-platform/micro';
import * as cardinal from '@journeyapps-platform/types-cardinal';
import { Router } from '../../router';
import * as v2 from '../v2/policies';
import * as api from '../../../api';
import * as bson from 'bson';
import { CardinalModel, PolicyModelAction } from '@journeyapps-platform/cardinal-catalog';

const list_scoped_policies = Router.post('/api/v1/scoped/policies/list', {
  validator: micro.schema.createTsCodecValidator(cardinal.ListScopedPolicyParams),
  handler: async (payload) => {
    const res = await v2.list_policies.handler({
      ...payload,
      params: {
        org_id: payload.params.org_id
      }
    });
    return res.items;
  }
});

const list_unscoped_policies = Router.get('/api/v1/unscoped/policies/list', {
  handler: async (payload) => {
    const res = await v2.list_policies.handler({
      ...payload,
      params: {
        org_id: {
          exists: false
        }
      }
    });
    return res.items;
  }
});

const create_scoped_policy = Router.post('/api/v1/scoped/policies/create', {
  validator: v2.create_scoped_policy.validator,
  authorize: v2.create_scoped_policy.authorize,
  handler: v2.create_scoped_policy.handler
});

const create_unscoped_policy = Router.post('/api/v1/unscoped/policies/create', {
  validator: v2.create_unscoped_policy.validator,
  authorize: v2.create_unscoped_policy.authorize,
  handler: v2.create_unscoped_policy.handler
});

const get_policy_assignments = Router.get('/api/v1/policies/:id/assignments', {
  validator: micro.schema.createTsCodecValidator(cardinal.GetPolicyAssignments),
  authorize: async ({ params, context }) => {
    return context.viewer.can(PolicyModelAction.READ, CardinalModel.POLICY, params.id);
  },
  handler: async ({ params, context }) => {
    const assignments = await api.policies.getPolicyAssignments(context.system.mongo, params.id);
    const extract_ids = (data: { _id: bson.ObjectId }[]) => {
      return data.map((datum) => datum._id.toHexString());
    };
    return {
      user_ids: extract_ids(assignments.users),
      role_ids: extract_ids(assignments.roles),
      token_ids: extract_ids(assignments.tokens)
    };
  }
});

const update_policy = Router.post('/api/v1/policies/:id/update', {
  validator: v2.update_policy.validator,
  authorize: v2.update_policy.authorize,
  handler: v2.update_policy.handler
});

const delete_policy = Router.method(micro.router.Method.Delete, '/api/v1/policies/:id', {
  validator: v2.delete_policy.validator,
  authorize: v2.delete_policy.authorize,
  handler: v2.delete_policy.handler
});

export const policy_routes = [
  list_scoped_policies,
  list_unscoped_policies,
  create_scoped_policy,
  create_unscoped_policy,
  get_policy_assignments,
  delete_policy,
  update_policy
];
