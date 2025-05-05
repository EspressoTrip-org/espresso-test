import '@journeyapps-platform/micro/register';

import * as micro from '@journeyapps-platform/micro';
import * as routes from './router/routes/index';
import { Router } from './router/router';
import * as consumers from './consumers/index';
import { System } from './system/index';
import * as auth from './auth/index';
import fastify from 'fastify';
import env from './env';

const server = fastify();

const system = System.fromENV(env);
const jwt_decoder = auth.createJWTDecoder(system, {
  issuer_url: env.JWT_ISSUER,
  verify: !env.DEV_MODE_DO_NOT_ENABLE_IN_PRODUCTION_OR_YOU_WILL_BE_FIRED
});

const token_decoder = auth.createTokenDecoder(system);
const dev_decoder = auth.createDevDecoder();

const decoders = [jwt_decoder, token_decoder];
if (env.DEV_MODE_DO_NOT_ENABLE_IN_PRODUCTION_OR_YOU_WILL_BE_FIRED) {
  decoders.push(dev_decoder);
}

server.register(
  Router.plugin({
    routes: [...routes.v1_routes, ...routes.v2_routes, ...micro.router.createProbeRoutes()],
    contextProvider: async (payload) => {
      return {
        system: system,
        viewer: await auth.createViewer({
          token: payload.request.headers['authorization'] || '',
          system,
          decoders
        }),
        sha: env.SHA
      };
    }
  })
);

(async () => {
  await system.start();

  await micro.fastify.startServer(server, env.PORT);
  micro.logger.info(`HTTP server running on port ${env.PORT}`);
  await micro.signals.getSystemProbe().ready();

  const [resource_events_consumer, cache_invalidator] = await Promise.all([
    consumers.createResourceOperationEventsConsumer(system),
    consumers.createCacheInvalidator(system)
  ]);

  micro.signals.getTerminationHandler()?.handleTerminationSignal(async () => {
    await Promise.all([resource_events_consumer.disconnect(), cache_invalidator.disconnect()]);
  });
})().catch((err) => {
  micro.logger.error('Something went wrong while booting', err);
  process.exit(1);
});
