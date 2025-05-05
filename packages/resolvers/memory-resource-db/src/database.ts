import * as entity_resolver from '@journeyapps-platform/recon-entity-resolver';
import * as micro_tracing from '@journeyapps-platform/micro-tracing';
import * as transactions from './transactions';
import * as defs from './definitions';
import * as queries from './queries';

type Params = {
  schema: defs.Schema;
};

export const createInMemoryResourceDatabase = (
  params: Params,
  override?: defs.DB
): entity_resolver.ResourceDatabase => {
  const db: defs.DB = override || {
    document_stores: {},
    index_stores: {},
    schema: params.schema
  };

  return {
    async transact(model, docs) {
      micro_tracing.trace('transact', (span) => {
        span.setAttributes({
          model: model,
          'num-docs': docs.length
        });

        transactions.transact(db, {
          model,
          documents: docs
        });
      });
    },

    async redact(model, ids) {
      micro_tracing.trace('redact', (span) => {
        span.setAttributes({
          model: model,
          'num-docs': ids.length
        });

        transactions.redact(db, {
          model,
          ids
        });
      });
    },

    async resolveEntityIds(model, statements, entity_filter) {
      return micro_tracing.trace('resolve-ids', (span) => {
        span.setAttributes({
          model: model,
          entity_filter: JSON.stringify(entity_filter)
        });

        return queries.query(db, {
          model,
          statements,
          entity_filter
        });
      });
    },

    async speculate(data) {
      return micro_tracing.trace('create-speculative-db', (span) => {
        span.setAttributes({
          speculative_models: Object.keys(data)
        });
        return createInMemoryResourceDatabase(params, transactions.speculate(db, data));
      });
    }
  };
};
