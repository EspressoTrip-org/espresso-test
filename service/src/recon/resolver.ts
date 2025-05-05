import { InterServiceClient } from '@journeyapps-platform/sdk-inter-service';
import * as resolver from '@journeyapps-platform/recon-entity-resolver';
import * as memory_db from '@journeyapps-platform/recon-memory-db';
import * as resource_provider from './resource-provider';
import { MongoDB } from '../system/mongo';

export const schema: memory_db.Schema = {
  organization: {
    scope_path: ['organization'],
    indexes: ['organization_id']
  },
  user: {
    scope_path: ['organization'],
    indexes: ['organization_id']
  },
  policy: {
    scope_path: ['organization'],
    indexes: ['organization_id']
  },
  role: {
    scope_path: ['organization'],
    indexes: ['organization_id']
  },
  token: {
    scope_path: ['organization'],
    indexes: ['organization_id']
  }
};

type CreateResolverParams = {
  external: {
    endpoint: string;
    client: InterServiceClient;
  };
};
export const createResolver = (mongo: MongoDB, params?: CreateResolverParams) => {
  const providers = [resource_provider.createMongoResourceProvider(mongo)];
  if (params?.external) {
    providers.push(resource_provider.createExternalResourceProvider(params.external.endpoint, params.external.client));
  }

  return resolver.createEntityResolver({
    db: memory_db.createInMemoryResourceDatabase({ schema }),
    resource_providers: providers
  });
};
