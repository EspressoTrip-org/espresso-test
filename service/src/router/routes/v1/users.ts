import * as micro from '@journeyapps-platform/micro';
import * as cardinal from '@journeyapps-platform/types-cardinal';
import { Router } from '../../router';
import * as auth from '../../../auth';
import * as api from '../../../api';
import { CardinalModel, UserModelAction } from '@journeyapps-platform/cardinal-catalog';

export const get_user = Router.get('/api/v1/users/:id', {
  validator: micro.schema.createTsCodecValidator(cardinal.GetUserParams),
  authorize: async ({ params, context }) => {
    return context.viewer.can(UserModelAction.READ, CardinalModel.USER, params.id);
  },
  handler: async ({ params, context }) => {
    const user = await api.users.getUser(context.system.mongo, params.id);
    const [policies, roles] = await Promise.all([
      api.policies.getPoliciesByIds(context.system.mongo, user.policy_ids || []),
      api.roles.getRoles(context.system.mongo, user.role_ids || [])
    ]);

    return {
      ...user,
      policies: policies,
      roles: roles
    };
  }
});

export const update_user_assignments = Router.post('/api/v1/users/:id/update-assignments', {
  validator: micro.schema.createTsCodecValidator(cardinal.UpdateUserAssignments),
  authorize: auth.users.authorizedToUpdateUserAssociations,
  handler: ({ params, context }) => {
    return api.users.updateUserAssignments(context.system, {
      actor: context.viewer.actor,
      ...params
    });
  }
});

export const assign_policy_to_user = Router.post('/api/v1/users/:id/assign-policy', {
  validator: micro.schema.createTsCodecValidator(cardinal.UpdateUserPolicyAssignmentParams),
  authorize: auth.users.authorizedToUpdateUserPolicyAssociation,
  handler: ({ params, context }) => {
    return api.users.updateUserAssignment(context.system, {
      actor: context.viewer.actor,
      op: 'add',
      assignment: 'policy_ids',
      assignment_id: params.policy_id,
      id: params.id
    });
  }
});

export const unassign_policy_to_user = Router.post('/api/v1/users/:id/unassign-policy', {
  validator: micro.schema.createTsCodecValidator(cardinal.UpdateUserPolicyAssignmentParams),
  authorize: auth.users.authorizedToUpdateUserPolicyAssociation,
  handler: ({ params, context }) => {
    return api.users.updateUserAssignment(context.system, {
      actor: context.viewer.actor,
      op: 'remove',
      assignment: 'policy_ids',
      assignment_id: params.policy_id,
      id: params.id
    });
  }
});

export const assign_role_to_user = Router.post('/api/v1/users/:id/assign-role', {
  validator: micro.schema.createTsCodecValidator(cardinal.UpdateUserRoleAssignmentParams),
  authorize: auth.users.authorizedToUpdateUserRoleAssociation,
  handler: ({ params, context }) => {
    return api.users.updateUserAssignment(context.system, {
      actor: context.viewer.actor,
      op: 'add',
      assignment: 'role_ids',
      assignment_id: params.role_id,
      id: params.id
    });
  }
});

export const unassign_role_to_user = Router.post('/api/v1/users/:id/unassign-role', {
  validator: micro.schema.createTsCodecValidator(cardinal.UpdateUserRoleAssignmentParams),
  authorize: auth.users.authorizedToUpdateUserRoleAssociation,
  handler: ({ params, context }) => {
    return api.users.updateUserAssignment(context.system, {
      actor: context.viewer.actor,
      op: 'remove',
      assignment: 'role_ids',
      assignment_id: params.role_id,
      id: params.id
    });
  }
});

export const user_routes = [
  update_user_assignments,
  get_user,
  assign_policy_to_user,
  unassign_policy_to_user,
  assign_role_to_user,
  unassign_role_to_user
];
