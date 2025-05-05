// transitive dependencies
import type * as micro from '@journeyapps-platform/micro';

import * as policies from './policies';
import * as tokens from './tokens';
import * as query from './query';
import * as roles from './roles';
import * as users from './users';

export const v1_routes = [
  ...users.user_routes,
  ...policies.policy_routes,
  ...roles.role_routes,
  ...tokens.token_routes,
  ...query.query_routes
];
