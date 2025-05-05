import * as entity_resolver from '@journeyapps-platform/recon-entity-resolver';
import * as micro_tracing from '@journeyapps-platform/micro-tracing';
import * as micro_logger from '@journeyapps-platform/micro-logger';
import * as sdk from '@journeyapps-platform/sdk-common';

const logger = micro_logger.createLogger('http-resource-provider');

export type Provider = {
  models: string[];
  endpoint: string;
};

export type ProviderConfig = {
  providers: Provider[];
};

export type CreateHttpResourceProviderParams = ProviderConfig & {
  client?: sdk.NodeNetworkClient;
  headers?: sdk.HeaderCollector;
};

/**
 * Creates an HTTP resource provider for collecting document resources from arbitrary endpoints
 */
export const createHttpResourceProvider = (
  params: CreateHttpResourceProviderParams
): entity_resolver.ResourceProvider => {
  const client = params.client || sdk.createNodeNetworkClient();

  return {
    models: params.providers.map((provider) => provider.models).flat(),
    async fetch(model, ids) {
      return micro_tracing.trace('fetch-resources', async (span) => {
        const provider = params.providers.find((provider) => {
          return provider.models.includes(model);
        });
        if (!provider) {
          throw new Error(`no provider configured for the model '${model}'`);
        }

        span.setAttribute('endpoint', provider.endpoint);

        const res = await client.request(provider.endpoint, {
          headers: params.headers,
          method: sdk.METHOD.POST,
          body: {
            model: model,
            ids: ids
          },
          retryable: true
        });

        /**
         * We want to throw here to ensure the recon DB never gets out of sync.
         *
         * If we ran into 5xx errors then the `retryable: true` option above should handle those. If we burn
         * through all retries before whatever network error is causing the 5xx then further failures should
         * block the consumer that is calling invalidate.
         *
         * If this throws other errors like 4xx errors this this normally indicates configuration errors and
         * we want this to block service boot. In other words the `.init()` will end up throwing
         */
        if (res.response.status >= 300) {
          logger.error(`Failed to collect resources from provider`, {
            status: res.response.status,
            response: await res.response.text()
          });
          throw new Error(`Received status code ${res.response.status}. Could not collect resource`);
        }

        const docs = await res.decode<entity_resolver.Document[]>();
        if (!docs) {
          return [];
        }

        span.setAttributes({
          total_docs: docs.length
        });

        return docs;
      });
    }
  };
};
