// transitive dependency
import type * as micro from '@journeyapps-platform/micro';

import * as assignments from './assignments';
import * as policies from './policies';
import * as tokens from './tokens';
import * as roles from './roles';
import * as query from './query';

export const v2_routes = [
  ...assignments.routes,
  ...policies.routes,
  ...roles.routes,
  ...tokens.routes,
  ...query.routes
];
