import * as micro from '@journeyapps-platform/micro';
import * as cardinal from '@journeyapps-platform/types-cardinal';
import { Router } from '../../router';
import * as errors from '../../../errors';
import * as auth from '../../../auth';
import * as api from '../../../api';
import { CardinalModel, RoleModelAction } from '@journeyapps-platform/cardinal-catalog';

export const list_roles = Router.post(cardinal.ROUTES_V2.LIST_ROLES, {
  validator: micro.schema.createTsCodecValidator(cardinal.V2ListResourceParams),
  handler: ({ params, context }) => {
    return api.roles.listRoles(context.system, {
      ...params,
      policies: context.viewer.policies
    });
  }
});

export const create_role = Router.post(cardinal.ROUTES_V2.CREATE_ROLE, {
  validator: micro.schema.createTsCodecValidator(cardinal.CreateRoleParams),
  authorize: auth.roles.authorizedToCreateRole,
  handler: ({ params, context }) => {
    return api.roles.createRole(context.system, {
      actor: context.viewer.actor,
      role: {
        name: params.name,
        org_id: params.org_id,
        policy_ids: params.policy_ids
      }
    });
  }
});

export const update_role = Router.post(cardinal.ROUTES_V2.UPDATE_ROLE, {
  validator: micro.schema.createTsCodecValidator(cardinal.UpdateRoleParams),
  authorize: auth.roles.authorizedToUpdateRole,
  handler: ({ params, context }) => {
    return api.roles.updateRole(context.system, {
      actor: context.viewer.actor,
      role: params
    });
  }
});

export const delete_role = Router.post(cardinal.ROUTES_V2.DELETE_ROLE, {
  validator: micro.schema.createTsCodecValidator(cardinal.DeleteRoleParams),
  authorize: async ({ params, context }) => {
    const role = await api.roles.getRole(context.system.mongo, params.id);
    if (role.managed) {
      throw new errors.ManagedResourceError(role.id);
    }

    return context.viewer.can(RoleModelAction.DELETE, CardinalModel.ROLE, role.id);
  },
  handler: async ({ params, context }) => {
    await api.roles.deleteRole(context.system, {
      actor: context.viewer.actor,
      id: params.id
    });
    return true;
  }
});

export const routes = [list_roles, create_role, update_role, delete_role];
