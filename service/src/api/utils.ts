import { EntityFilter } from '@journeyapps-platform/recon-entity-resolver';
import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro from '@journeyapps-platform/micro';
import { System } from '../system';
import * as mongo from 'mongodb';
import * as bson from 'bson';
import { Actor } from '@journeyapps-platform/types-cardinal';

export type WithActor<T> = T & {
  actor: Actor;
};

export type OptionalPermissions<T> = T & {
  policies?: cardinal.RawPolicy[];
};

export type RequirePermissions<T> = T & {
  policies: cardinal.RawPolicy[];
};

export const getByIdOrThrow = async <T extends micro.db.Id>(collection: mongo.Collection<T>, id: string) => {
  const res = await collection.findOne(micro.mongo.getById(id) as mongo.Filter<T>);
  if (!res) {
    throw new micro.errors.ResourceNotFound(collection.collectionName, id);
  }
  return micro.mongo.toJson(res);
};

type WrapQueryParams<T> = OptionalPermissions<cardinal.V2ListResourceParams> & {
  query: mongo.Filter<T>;
  model: string;
};
export const wrapQueryWithPermissions = async <T extends micro.db.Id & { org_id?: string; user_id?: string }>(
  system: System,
  params: WrapQueryParams<T>
): Promise<any> => {
  if (!params.policies) {
    return params.query;
  }
  const entity_filter: EntityFilter = {};
  if (params.id && !micro.mongo.isQueryFilter(params.id)) {
    entity_filter.id = params.id;
  }
  if (params.org_id && !micro.mongo.isQueryFilter(params.org_id)) {
    entity_filter.organization_id = params.org_id;
  }
  if (params.user_id && !micro.mongo.isQueryFilter(params.user_id)) {
    entity_filter.user_id = params.user_id;
  }

  const ids = await system.resolver.resolveResourceIds({
    policies: params.policies,
    model: params.model,
    entity_filter
  });

  return {
    $and: [
      {
        _id: {
          $in: ids.map((id) => new bson.ObjectId(id))
        }
      },
      params.query
    ]
  };
};
