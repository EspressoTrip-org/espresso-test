import * as micro from '@journeyapps-platform/micro';
import * as auth from '../auth';

export const Router = new micro.fastify.FastifyRouter<auth.Context>({
  concurrency: {
    max_concurrent_requests: 2,
    max_queue_depth: 10
  },
  tags: (payload): Record<string, string> => {
    if (!auth.isJWTClaim(payload.context.viewer.claim)) {
      return {};
    }

    const user_id = payload.context.viewer.claim?.user_id;
    if (!user_id) {
      return {};
    }
    return {
      user_id: user_id
    };
  }
});
