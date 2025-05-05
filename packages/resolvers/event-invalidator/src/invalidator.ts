import * as entity_resolver from '@journeyapps-platform/recon-entity-resolver';
import * as micro_tracing from '@journeyapps-platform/micro-tracing';
import * as micro_logger from '@journeyapps-platform/micro-logger';
import * as micro_kafka from '@journeyapps-platform/micro-kafka';
import * as defs from './definitions';
import * as kafka from 'kafkajs';
import * as uuid from 'uuid';

const logger = micro_logger.createLogger('recon-event-invalidator');

export type EventInvalidator = {
  waitForSync(topics?: string[] | micro_kafka.consumers.TopicPartitionOffsets): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
};

export type CreateEventInvalidatorParams = {
  resolver: entity_resolver.EntityResolver;
  kafka: kafka.Kafka;
  modules: defs.TopicModule[];
};
export const createEventInvalidator = (params: CreateEventInvalidatorParams): EventInvalidator => {
  const group_id = `recon-invalidator-${uuid.v4().substring(0, 7)}`;

  let monitor: micro_kafka.consumers.ConsumerSyncMonitor | null = null;
  let consumer: kafka.Consumer | null;

  return {
    async waitForSync(topics) {
      await micro_tracing.trace('wait-for-sync', () => {
        if (!monitor) {
          throw new Error('invalidator needs to be started');
        }
        return monitor.waitForSync(topics);
      });
    },

    async start() {
      monitor = micro_kafka.consumers.createConsumerLagMonitor(params.kafka);
      await monitor.connect();

      consumer = await micro_kafka.consumers.createHighLevelConsumer(params.kafka, {
        group_id: group_id,
        run_config: {
          autoCommit: false
        },
        subscriptions: params.modules.map((module) => {
          return {
            topic: module.topic,
            fromBeginning: false
          };
        }),
        eachBatch: async (payload) => {
          for (const mod of params.modules) {
            if (mod.topic !== payload.batch.topic) {
              continue;
            }

            const invalidations = await mod.handler(payload);

            for (const model of Object.keys(invalidations)) {
              const ids = invalidations[model];
              if (ids.length === 0) {
                continue;
              }

              logger.info(`invalidating ${model}`);

              await params.resolver.invalidate({
                model: model,
                ids: ids
              });
            }
          }
        }
      });

      monitor.attach(consumer);
    },
    async stop() {
      const ops = [];
      if (consumer) {
        ops.push(consumer.disconnect());
      }
      if (monitor) {
        ops.push(monitor.disconnect());
      }

      await Promise.all(ops);
    }
  };
};
