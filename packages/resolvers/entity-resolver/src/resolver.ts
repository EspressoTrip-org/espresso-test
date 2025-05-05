import * as micro_tracing from '@journeyapps-platform/micro-tracing';
import * as micro_logger from '@journeyapps-platform/micro-logger';
import * as reducer from './reduce-policies';
import * as defs from './definitions';

const logger = micro_logger.createLogger('recon-entity-resolver');

const inverseModelMappings = (providers: defs.ResourceProvider[]) => {
  return providers.reduce((mapping: Record<string, defs.ResourceProvider>, provider) => {
    return provider.models.reduce((mapping, model) => {
      mapping[model] = provider;
      return mapping;
    }, mapping);
  }, {});
};

export type CreateEntityResolverParams = {
  db: defs.ResourceDatabase;
  resource_providers: defs.ResourceProvider[];
  default_scope_path?: defs.ScopePath;
};

export const createEntityResolver = (params: CreateEntityResolverParams): defs.EntityResolver => {
  const { db } = params;

  const model_mapping = inverseModelMappings(params.resource_providers);

  const fetch = async (model: string, ids?: string[]) => {
    const provider = model_mapping[model];

    if (!provider) {
      logger.warn('no providers serve the requested model');
      return [];
    }

    return provider.fetch(model, ids);
  };

  return {
    async resolveResourceIds(params) {
      const speculative_keys = Object.keys(params.speculative_data || {});

      return micro_tracing.trace('resolve-entity-ids', async (span) => {
        span.setAttributes({
          actions: params.actions,
          model: params.model,
          speculative_keys: speculative_keys,
          speculative: speculative_keys.length > 0
        });

        if (params.entity_filter) {
          span.addEvent('entity-filter', params.entity_filter);
        }

        const statements = reducer.reduceValidStatements(params.policies, params.actions || ['read'], params.model);

        // Produce a new speculative DB from an injected data set. This will not be persisted to the
        // original DB
        let query_db = db;
        if (speculative_keys.length > 0) {
          query_db = await query_db.speculate(params.speculative_data || {});
        }

        const ids = await query_db.resolveEntityIds(params.model, statements, params.entity_filter);
        span.setAttribute('resolved-ids', ids.length);
        return ids;
      });
    },

    async canAccessResource(params) {
      const ids = await this.resolveResourceIds({
        ...params,
        entity_filter: {
          id: params.id
        }
      });
      return ids.length > 0;
    },

    async invalidate(params) {
      await micro_tracing.trace('invalidate', async (span) => {
        span.setAttributes({
          model: params.model,
          ids: params.ids
        });

        const documents = await fetch(params.model, params.ids);
        span.setAttribute('documents', documents.length);

        if (params.ids) {
          const redaction_ids = params.ids.filter((id) => {
            return !!documents.find((doc) => {
              return doc.id === id;
            });
          });
          if (redaction_ids.length) {
            await db.redact(params.model, redaction_ids);
          }
        }

        await db.transact(params.model, documents);
      });
    },
    async init(custom_models) {
      const models = custom_models || Object.keys(model_mapping);
      await micro_tracing.trace('init', async (span) => {
        span.setAttribute('models', models);

        for (const model of models) {
          logger.info(`initializing ${model}`);

          const documents = await fetch(model);
          span.setAttribute(`${model}.documents`, documents.length);

          await db.transact(model, documents);
        }
      });
    }
  };
};
