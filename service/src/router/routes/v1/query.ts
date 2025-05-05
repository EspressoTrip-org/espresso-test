// transitive dependencies
import type * as micro from '@journeyapps-platform/micro';

import { Router } from '../../router';
import * as v2 from '../v2/query';

export const policies_for_user = Router.get('/api/v1/users/:user_id/get-policies', {
  validator: v2.policies_for_user.validator,
  authorize: v2.policies_for_user.authorize,
  handler: v2.policies_for_user.handler
});

export const policies_for_token = Router.post('/api/v1/tokens/get-policies', {
  validator: v2.policies_for_token.validator,
  authorize: v2.policies_for_token.authorize,
  handler: v2.policies_for_token.handler
});

export const query_routes = [policies_for_user, policies_for_token];
