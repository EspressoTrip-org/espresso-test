import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro from '@journeyapps-platform/micro';
import { Router } from '../../router';
import * as errors from '../../../errors';
import * as api from '../../../api';
import { CardinalModel, TokenModelAction, UserModelAction } from '@journeyapps-platform/cardinal-catalog';

export const policies_for_user = Router.post(cardinal.ROUTES_V2.QUERY_POLICIES_FOR_USER, {
  validator: micro.schema.createTsCodecValidator(cardinal.QueryPoliciesForUser),
  authorize: async ({ params, context }) => {
    return context.viewer.can(UserModelAction.READ, CardinalModel.USER, params.user_id);
  },
  handler: ({ params, context }) => {
    return api.policies.getPoliciesForUser(context.system, {
      user_id: params.user_id,
      policies: context.viewer.policies
    });
  }
});

export const policies_for_token = Router.post(cardinal.ROUTES_V2.QUERY_POLICIES_FOR_TOKEN, {
  validator: micro.schema.createTsCodecValidator(cardinal.QueryPoliciesForToken),
  authorize: async ({ params, context }) => {
    const token = await api.tokens.getTokenByValue(context.system.mongo, params.token);
    if (!token) {
      throw new errors.Error404('token', '<redacted>');
    }
    return context.viewer.can(TokenModelAction.READ, CardinalModel.TOKEN, token.id);
  },
  handler: async ({ params, context }) => {
    const token = await api.tokens.getTokenByValue(context.system.mongo, params.token);
    if (!token) {
      throw new errors.Error404('token', '<redacted>');
    }
    return api.policies.getPoliciesForToken(context.system, {
      token_id: token.id,
      policies: context.viewer.policies
    });
  }
});

export const routes = [policies_for_user, policies_for_token];
