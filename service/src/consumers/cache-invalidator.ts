import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro from '@journeyapps-platform/micro';
import { System } from '../system/index';
import * as crypto from 'node:crypto';

const logger = micro.logging.createLogger('cache-invalidator');

export const createCacheInvalidator = async (system: System) => {
  const topic = cardinal.KAFKA_TOPIC.AUTH_EVENTS;
  const group_id = `cardinal.auth-events-${crypto.randomBytes(12).toString('hex')}`;

  return micro.kafka.consumers.createHighLevelConsumer(system.kafka('cache-invalidator'), {
    group_id: group_id,
    subscriptions: [
      {
        fromBeginning: false,
        topic: topic
      }
    ],
    run_config: {
      autoCommit: false
    },
    eachMessage: async () => {
      logger.info(`Auth event received - clearing policy cache`);
      await system.policy_cache.clear();
    }
  });
};
