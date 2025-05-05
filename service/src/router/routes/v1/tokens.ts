// transitive dependencies
import * as micro from '@journeyapps-platform/micro';
import * as cardinal from '@journeyapps-platform/types-cardinal';
import { Router } from '../../router';
import * as v2 from '../v2/tokens';

const list_scoped_tokens = Router.post('/api/v1/scoped/tokens/list', {
  validator: micro.schema.createTsCodecValidator(cardinal.ListScopedTokenParams),
  handler: async (payload) => {
    const res = await v2.list_tokens.handler({
      ...payload,
      params: {
        org_id: payload.params.org_id
      }
    });
    return res.items;
  }
});

const list_unscoped_tokens = Router.get('/api/v1/unscoped/tokens/list', {
  handler: (payload) => {
    return v2.list_tokens.handler({
      ...payload,
      params: {
        org_id: {
          exists: false
        }
      }
    });
  }
});

export const create_scoped_token = Router.post('/api/v1/scoped/tokens/create', {
  validator: v2.create_scoped_token.validator,
  authorize: v2.create_scoped_token.authorize,
  handler: v2.create_scoped_token.handler
});

export const create_unscoped_token = Router.post('/api/v1/unscoped/tokens/create', {
  validator: v2.create_unscoped_token.validator,
  authorize: v2.create_unscoped_token.authorize,
  handler: v2.create_unscoped_token.handler
});

export const update_token = Router.post('/api/v1/tokens/:id/update', {
  validator: v2.update_token.validator,
  authorize: v2.update_token.authorize,
  handler: v2.update_token.handler
});

const revoke_token = Router.method(micro.router.Method.Delete, '/api/v1/tokens/:id', {
  validator: v2.revoke_token.validator,
  authorize: v2.revoke_token.authorize,
  handler: v2.revoke_token.handler
});

export const token_routes = [
  list_scoped_tokens,
  list_unscoped_tokens,
  create_scoped_token,
  create_unscoped_token,
  revoke_token,
  update_token
];
