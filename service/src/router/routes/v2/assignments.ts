import * as micro from '@journeyapps-platform/micro';
import * as cardinal from '@journeyapps-platform/types-cardinal';
import { Router } from '../../router';
import * as auth from '../../../auth';
import * as api from '../../../api';
import { CardinalModel, PolicyModelAction, UserModelAction } from '@journeyapps-platform/cardinal-catalog';
import * as bson from 'bson';

export const get_user_assignments = Router.post(cardinal.ROUTES_V2.GET_USER_ASSIGNMENTS, {
  validator: micro.schema.createTsCodecValidator(cardinal.V2GetUserAssignmentParams),
  authorize: async ({ params, context }) => {
    return context.viewer.can(UserModelAction.READ, CardinalModel.USER, params.user_id);
  },
  handler: ({ params, context }) => {
    return api.users.getUser(context.system.mongo, params.user_id);
  }
});

export const assign_policy_to_user = Router.post(cardinal.ROUTES_V2.ASSIGN_POLICY_TO_USER, {
  validator: micro.schema.createTsCodecValidator(cardinal.V2UpdateUserPolicyAssignmentParams),

  authorize: (payload) =>
    auth.users.authorizedToUpdateUserPolicyAssociation({
      ...payload,
      params: {
        id: payload.params.user_id,
        policy_id: payload.params.policy_id
      }
    }),
  handler: ({ params, context }) => {
    return api.users.updateUserAssignment(context.system, {
      actor: context.viewer.actor,
      op: 'add',
      assignment: 'policy_ids',
      assignment_id: params.policy_id,
      id: params.user_id
    });
  }
});

export const unassign_policy_from_user = Router.post(cardinal.ROUTES_V2.UNASSIGN_POLICY_FROM_USER, {
  validator: micro.schema.createTsCodecValidator(cardinal.V2UpdateUserPolicyAssignmentParams),
  authorize: (payload) =>
    auth.users.authorizedToUpdateUserPolicyAssociation({
      ...payload,
      params: {
        id: payload.params.user_id,
        policy_id: payload.params.policy_id
      }
    }),
  handler: ({ params, context }) => {
    return api.users.updateUserAssignment(context.system, {
      actor: context.viewer.actor,
      op: 'remove',
      assignment: 'policy_ids',
      assignment_id: params.policy_id,
      id: params.user_id
    });
  }
});

export const assign_role_to_user = Router.post(cardinal.ROUTES_V2.ASSIGN_ROLE_TO_USER, {
  validator: micro.schema.createTsCodecValidator(cardinal.V2UpdateUserRoleAssignmentParams),
  authorize: (payload) =>
    auth.users.authorizedToUpdateUserRoleAssociation({
      ...payload,
      params: {
        id: payload.params.user_id,
        role_id: payload.params.role_id
      }
    }),
  handler: ({ params, context }) => {
    return api.users.updateUserAssignment(context.system, {
      actor: context.viewer.actor,
      op: 'add',
      assignment: 'role_ids',
      assignment_id: params.role_id,
      id: params.user_id
    });
  }
});

export const unassign_role_from_user = Router.post(cardinal.ROUTES_V2.UNASSIGN_ROLE_FROM_USER, {
  validator: micro.schema.createTsCodecValidator(cardinal.V2UpdateUserRoleAssignmentParams),
  authorize: (payload) =>
    auth.users.authorizedToUpdateUserRoleAssociation({
      ...payload,
      params: {
        id: payload.params.user_id,
        role_id: payload.params.role_id
      }
    }),
  handler: ({ params, context }) => {
    return api.users.updateUserAssignment(context.system, {
      actor: context.viewer.actor,
      op: 'remove',
      assignment: 'role_ids',
      assignment_id: params.role_id,
      id: params.user_id
    });
  }
});

export const get_policy_assignments = Router.post(cardinal.ROUTES_V2.GET_POLICY_ASSIGNMENTS, {
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

export const routes = [
  get_user_assignments,
  assign_policy_to_user,
  unassign_policy_from_user,
  assign_role_to_user,
  unassign_role_from_user,
  get_policy_assignments
];
