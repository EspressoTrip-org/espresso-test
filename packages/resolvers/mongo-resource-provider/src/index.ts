import * as entity_resolver from '@journeyapps-platform/recon-entity-resolver';
import * as mongo from 'mongodb';

type ModelConfig = {
  collection: mongo.Collection<any>;
  projection?: object;
};

export type CreateHttpResourceProviderParams = {
  models: Record<string, ModelConfig>;
};

export const createMongoResourceProvider = (
  params: CreateHttpResourceProviderParams
): entity_resolver.ResourceProvider => {
  return {
    models: Object.keys(params.models),
    async fetch(model, ids) {
      const config = params.models[model];
      if (!config) {
        throw new Error(`cannot provide for model ${model}`);
      }

      const pipeline = [];

      if (ids) {
        pipeline.push({
          $match: {
            _id: {
              $in: ids.map((id) => new mongo.ObjectId(id))
            }
          }
        });
      }

      pipeline.push({
        $project: {
          id: {
            $convert: {
              input: '$_id',
              to: 'string'
            }
          },
          _id: 0,
          ...(config.projection || {})
        }
      });

      return await config.collection.aggregate<entity_resolver.Document>(pipeline).toArray();
    }
  };
};
