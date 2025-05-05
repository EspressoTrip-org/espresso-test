import { InterServiceClient } from '@journeyapps-platform/sdk-inter-service';
import * as entity_resolver from '@journeyapps-platform/recon-entity-resolver';
import * as invalidator from '@journeyapps-platform/recon-event-invalidator';
import * as micro from '@journeyapps-platform/micro';
import * as adapters from '../adapters';
import * as kafka_utils from './kafka';
import * as resolver from '../recon';
import { MongoDB } from './mongo';
import * as kafka from 'kafkajs';
import ENV from '../env';

export type CreateSystemParams = {
  mocks: string[];
  accounts: {
    endpoint: string;
    client_id: string;
    client_secret: string;
  };
  mongo: micro.mongo.MongoDBAdapterOptions;
  kafka: micro.kafka.KafkaConnectionOptions;
  node_env: string;
};

export class System extends micro.system.MicroSystem {
  context: CreateSystemParams;

  mongo: MongoDB;
  kafka: micro.kafka.KafkaClientProvisioner;
  producer: kafka.Producer;
  resolver: entity_resolver.EntityResolver;

  policy_cache: adapters.policy_cache.PolicyCache;

  constructor(params: CreateSystemParams) {
    super();

    this.context = params;

    const inter_service = new InterServiceClient(params.accounts);

    this.mongo = this.withLifecycle(new MongoDB(params.mongo), {
      start(component) {
        return component.connect();
      },
      stop(component) {
        return component.close();
      }
    });

    this.kafka = this.withLifecycle(micro.kafka.createClientProvisioner(params.kafka), {
      start(component) {
        return kafka_utils.ensureTopics({
          kafka: component(),
          production: params.node_env === 'production'
        });
      }
    });

    this.producer = this.withLifecycle(
      this.kafka('producer').producer({
        createPartitioner: kafka.Partitioners.LegacyPartitioner
      }),
      {
        start(component) {
          return component.connect();
        },
        stop(component) {
          return component.disconnect();
        }
      }
    );

    this.resolver = this.withLifecycle(
      resolver.createResolver(
        this.mongo,
        params.mocks.includes('recon')
          ? undefined
          : {
              external: {
                endpoint: params.accounts.endpoint,
                client: inter_service
              }
            }
      ),
      {}
    );

    this.withLifecycle(
      invalidator.createEventInvalidator({
        resolver: this.resolver,
        kafka: this.kafka('invalidator'),
        modules: [invalidator.resource_operation_events_module, invalidator.cardinal_module]
      }),
      {
        start: async (invalidator) => {
          await invalidator.start();
          await this.resolver.init();
        },
        stop(invalidator) {
          return invalidator.stop();
        }
      }
    );

    this.policy_cache = adapters.policy_cache.createInMemoryPolicyCache();
  }

  static fromENV(env: typeof ENV) {
    return new System({
      mocks: env.MOCK,
      accounts: {
        endpoint: env.JWT_ISSUER,
        client_id: env.ACCOUNTS_CLIENT_ID,
        client_secret: env.ACCOUNTS_CLIENT_SECRET
      },
      mongo: {
        uri: env.MONGO_URI,
        database: env.MONGO_DATABASE,
        username: env.MONGO_USERNAME,
        password: env.MONGO_PASSWORD
      },
      kafka: {
        brokers: env.KAFKA_BROKERS,
        username: env.KAFKA_USERNAME,
        password: env.KAFKA_PASSWORD,
        mechanism: env.KAFKA_MECHANISM as any
      },
      node_env: env.NODE_ENV
    });
  }
}
