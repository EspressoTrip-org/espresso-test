import { MongoMemoryServer } from 'mongodb-memory-server-global';
import { MongoDB } from '../../src/system/mongo';

import * as adapters from '../../src/adapters';
import { System } from '../../src/system';
import * as recon from '../../src/recon';

export const createMockedSystem = async (): Promise<System> => {
  const mongod = await MongoMemoryServer.create();

  const mongo = new MongoDB({
    uri: mongod.getUri(),
    database: 'test'
  });

  const producer = {
    events: [] as any,
    clear: () => {
      producer.events = [];
    },
    send(data: any) {
      producer.events.push(data);
    }
  };

  const resolver = recon.createResolver(mongo);

  return {
    mongo: mongo,
    producer: producer as any,
    resolver: resolver,
    policy_cache: adapters.policy_cache.createNoopPolicyCache(),
    start: async () => {
      await mongo.connect();
    },
    stop: async () => {
      await mongo.close();
      await mongod.stop();
    }
  } as System;
};
