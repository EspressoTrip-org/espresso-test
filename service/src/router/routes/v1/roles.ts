// transitive dependencies
import * as micro from '@journeyapps-platform/micro';
import * as cardinal from '@journeyapps-platform/types-cardinal';
import { Router } from '../../router';
import * as v2 from '../v2/roles';

const list_roles = Router.post('/api/v1/roles/list', {
  validator: micro.schema.createTsCodecValidator(cardinal.ListRoleParams),
  handler: async (payload) => {
    const res = await v2.list_roles.handler({
      ...payload,
      params: {
        org_id: payload.params.org_id
      }
    });
    return res.items;
  }
});

const create_role = Router.post('/api/v1/roles/create', {
  validator: v2.create_role.validator,
  authorize: v2.create_role.authorize,
  handler: v2.create_role.handler
});

const update_role = Router.post('/api/v1/roles/:id/update', {
  validator: v2.update_role.validator,
  authorize: v2.update_role.authorize,
  handler: v2.update_role.handler
});

const delete_role = Router.method(micro.router.Method.Delete, '/api/v1/roles/:id', {
  validator: v2.delete_role.validator,
  authorize: v2.delete_role.authorize,
  handler: v2.delete_role.handler
});

export const role_routes = [list_roles, create_role, update_role, delete_role];
