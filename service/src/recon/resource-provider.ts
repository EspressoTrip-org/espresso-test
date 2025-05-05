import * as mongo_provider from '@journeyapps-platform/recon-mongo-resource-provider';
import * as http_provider from '@journeyapps-platform/recon-http-resource-provider';
import * as inter_service from '@journeyapps-platform/sdk-inter-service';
import * as sdk from '@journeyapps-platform/sdk-common';
import { MongoDB } from '../system/mongo';

export const createMongoResourceProvider = (mongo: MongoDB) => {
  return mongo_provider.createMongoResourceProvider({
    models: {
      organization: {
        collection: mongo.organizations,
        projection: {}
      },
      user: {
        collection: mongo.users,
        projection: {
          organization_id: '$org_id'
        }
      },
      policy: {
        collection: mongo.policies,
        projection: {
          organization_id: '$org_id'
        }
      },
      role: {
        collection: mongo.roles,
        projection: {
          organization_id: '$org_id'
        }
      },
      token: {
        collection: mongo.tokens,
        projection: {
          organization_id: '$org_id',
          'labels.user_id': '$user_id'
        }
      }
    }
  });
};

export const createExternalResourceProvider = (
  accounts_endpoint: string,
  inter_service: inter_service.InterServiceClient
) => {
  return http_provider.createHttpResourceProvider({
    providers: [
      {
        endpoint: sdk.join(accounts_endpoint, '/api/accounts/v5/resources/collect'),
        models: ['organization', 'user']
      }
    ],
    headers: async () => {
      return {
        Authorization: `Bearer ${await inter_service.getAccountsToken()}`
      };
    }
  });
};
