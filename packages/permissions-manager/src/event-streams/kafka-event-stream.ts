import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as event_stream from './event-stream';
import type { Consumer, Kafka } from 'kafkajs';
import * as uuid from 'uuid';
import { logger } from '@journeyapps-platform/micro-logger';

export type KafkaEventStream = event_stream.EventStream & {
  start: () => Promise<void>;
  shutdown: () => Promise<void>;
};

export const createKafkaEventStream = (client: Kafka): KafkaEventStream => {
  const handlers: event_stream.Handler[] = [];

  let disposers: Consumer[] = [];
  const group_id = `permissions-manager-${uuid.v4()}`;
  return {
    async start() {
      const micro_kafka = await import('@journeyapps-platform/micro-kafka');

      const consumer = await micro_kafka.consumers.createConsumer(client, {
        group_id,
        options: {
          maxWaitTimeInMs: 1000
        },
        subscriptions: [
          {
            fromBeginning: false,
            topic: cardinal.KAFKA_TOPIC.AUTH_EVENTS
          }
        ]
      });

      consumer.run({
        autoCommit: false,
        partitionsConsumedConcurrently: 24,
        eachMessage: async (payload) => {
          const event = JSON.parse(payload.message.value?.toString() || '');
          for (const handler of handlers) {
            try {
              await handler(event);
            } catch (e) {
              console.log(e);
            }
          }
        }
      });

      disposers.push(consumer);
    },
    async shutdown() {
      for (const disposer of disposers) {
        await disposer.disconnect();
        logger.info(`Cleaning up consumer group ${group_id}`);
        await client.admin().deleteGroups([group_id]);
      }
    },
    subscribe: (handler) => {
      handlers.push(handler);
    }
  };
};
