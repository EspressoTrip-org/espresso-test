import * as micro from '@journeyapps-platform/micro';
import * as cardinal from '@journeyapps-platform/types-cardinal';
import { Router } from '../../router';
import * as auth from '../../../auth';
import * as api from '../../../api';
import { CardinalModel, TokenModelAction } from '@journeyapps-platform/cardinal-catalog';
import { getUser } from '../../../api/users';

export const list_tokens = Router.post(cardinal.ROUTES_V2.LIST_TOKENS, {
  validator: micro.schema.createTsCodecValidator(cardinal.V2ListResourceParams),
  handler: async ({ params, context }) => {
    return api.tokens.listTokens(context.system, {
      ...params,
      policies: context.viewer.policies
    });
  }
});

export const create_scoped_token = Router.post(cardinal.ROUTES_V2.CREATE_SCOPED_TOKEN, {
  validator: micro.schema.createTsCodecValidator(cardinal.CreateScopedTokenParams),
  authorize: auth.tokens.authorizedToCreateToken,
  handler: ({ params, context }) => {
    return api.tokens.createToken(context.system, {
      actor: context.viewer.actor,
      token: {
        org_id: params.org_id,
        policy_ids: params.policy_ids,
        description: params.description
      }
    });
  }
});

export const create_unscoped_token = Router.post(cardinal.ROUTES_V2.CREATE_UNSCOPED_TOKEN, {
  validator: micro.schema.createTsCodecValidator(cardinal.CreateUnscopedTokenParams),
  authorize: auth.tokens.authorizedToCreateToken,
  handler: ({ params, context }) => {
    return api.tokens.createToken(context.system, {
      actor: context.viewer.actor,
      token: {
        policy_ids: params.policy_ids,
        description: params.description
      }
    });
  }
});

export const create_personal_token = Router.post(cardinal.ROUTES_V2.CREATE_PERSONAL_TOKEN, {
  validator: micro.schema.createTsCodecValidator(cardinal.CreatePersonalTokenParams),
  authorize: auth.tokens.authorizedToCreatePAT,
  handler: async ({ params, context }) => {
    const user = await getUser(context.system.mongo, params.user_id);
    return api.tokens.createToken(context.system, {
      actor: context.viewer.actor,
      token: {
        user_id: params.user_id,
        org_id: user.org_id,
        policy_ids: params.policy_ids,
        description: params.description
      }
    });
  }
});

export const update_token = Router.post(cardinal.ROUTES_V2.UPDATE_TOKEN, {
  validator: micro.schema.createTsCodecValidator(cardinal.UpdateTokenParams),
  authorize: auth.tokens.authorizedToUpdateToken,
  handler: ({ params, context }) => {
    return api.tokens.updateToken(context.system, {
      actor: context.viewer.actor,
      token: params
    });
  }
});

export const revoke_token = Router.post(cardinal.ROUTES_V2.DELETE_TOKEN, {
  validator: micro.schema.createTsCodecValidator(cardinal.DeleteTokenParams),
  authorize: async ({ params, context }) => {
    return context.viewer.can(TokenModelAction.REVOKE, CardinalModel.TOKEN, params.id);
  },
  handler: async ({ params, context }) => {
    const token = await api.tokens.getToken(context.system.mongo, params.id);
    await api.tokens.deleteToken(context.system, {
      actor: context.viewer.actor,
      id: token.id
    });
    return true;
  }
});

export const routes = [
  list_tokens,
  create_scoped_token,
  create_unscoped_token,
  create_personal_token,
  revoke_token,
  update_token
];
