import * as cardinal from '@journeyapps-platform/types-cardinal';
import type * as mongo from 'mongodb';
import * as bson from 'bson';

export type IFilterQueryConstructor<T> = (permission: cardinal.Permission) => mongo.Filter<T> | null | undefined;

/**
 * Utility to augment a MongoDB query with filter criteria generated from a set of permissions. This ensures the permission criteria are
 * not overridden by the provided query and that it fails closed in the case of no permissions.
 *
 * A query constructor must be provided which should return a MongoDB FilterQuery from a single given permission. This query will be $or'd
 * with all other constructed queries and then $and'ed with the given to-be-wrapped query.
 */
export const createFilterQueryFromPermissionSet = <T>(
  permissions: cardinal.Permission[],
  constructor: IFilterQueryConstructor<T>,
  query: mongo.Filter<T>
) => {
  const { allow, deny } = cardinal.splitByEffect(permissions);

  const constructFilterCriteria = (permissions: cardinal.Permission[], operand: '$or' | '$nor') => {
    return permissions.reduce((filter: mongo.Filter<any>, permission) => {
      if (!filter[operand]) {
        filter[operand] = [];
      }
      const query = constructor(permission);
      if (!query) {
        return filter;
      }
      filter[operand]!.push(query as any);
      return filter;
    }, {});
  };

  const deny_criteria = constructFilterCriteria(deny, '$nor');
  const allow_criteria = constructFilterCriteria(allow, '$or');

  // Fail closed if no permissions went into generating this query
  if (!allow_criteria.$or || allow_criteria.$or.length === 0) {
    return null;
  }

  const criteria = {
    $and: [allow_criteria, query]
  };

  if (deny_criteria.$nor?.length) {
    criteria.$and.push(deny_criteria);
  }

  return criteria as mongo.Filter<T>;
};

/**
 * Given a field from a permission return a mongo QuerySelector based on its value.
 *
 * - If it is a standard string, return it as-is
 * - If it is a wildcard ('*') return an `{$exists: true}` filter
 * - If it is empty/undefined/null - return an `{$exists: false}` filter
 */
export const matchWithWildcards = <T>(field?: cardinal.StringOr): mongo.FilterOperators<T> | string[] => {
  if (field == null) {
    return {
      $exists: false
    };
  }
  const fields = cardinal.castToArray(field);
  if (fields.includes('*')) {
    return {
      $exists: true
    };
  }
  return fields;
};

/**
 * The same as matchWithWildcards except that if the result is still a string it is assumed
 * to be an ObjectId and converted as such.
 *
 * If the `loose` parameter is true then an $in query selector is returned, matching both
 * the `string` and `ObjectId` forms of the field (loosely typed)
 */
export const matchIdWithWildcards = (
  field?: cardinal.StringOr,
  loose: boolean = false
): mongo.FilterOperators<any> | bson.ObjectId => {
  const match = matchWithWildcards(field);
  if (Array.isArray(match)) {
    return {
      $in: match
        .map((field) => {
          if (loose) {
            if (!bson.ObjectId.isValid(field)) {
              return [field];
            }
            return [field, new bson.ObjectId(field)];
          } else {
            if (!bson.ObjectId.isValid(field)) {
              return [];
            }
            return [new bson.ObjectId(field)];
          }
        })
        .flat()
    };
  }
  return match;
};

export type OrgScopedResource = {
  org_id?: string | bson.ObjectId;
};

export type LabelQueryConstructor = (
  key: string,
  value: cardinal.StringOr,
  labels: cardinal.SelectorLabels
) => mongo.FilterOperators<string>;
export const defaultLabelQueryConstructor: LabelQueryConstructor = (key: string, value: cardinal.StringOr) => {
  return {
    [`labels.${key}`]: {
      $in: cardinal.castToArray(value)
    }
  };
};

/**
 * A top-level query constructor that assumes the datum schema contains an `org_id` field. This will construct a
 * mongo query from a permission, mapping the permission scope to the `org_id` field and the first resource id
 * to the _id field
 *
 * Does not work for nested permissions. Use the underlying query constructor for nested permissions
 */
export const orgScopedResourceQueryConstructor =
  (
    label_query_constructor: LabelQueryConstructor = defaultLabelQueryConstructor
  ): IFilterQueryConstructor<OrgScopedResource> =>
  (permission) => {
    if (cardinal.isIDResourceSelector(permission.resource.selector)) {
      return {
        _id: matchIdWithWildcards(permission.resource.selector.id),
        org_id: matchIdWithWildcards(permission.resource.scope, true)
      };
    }

    // We map over all label pairs passing them to the label query constructor. This is done
    // as such to allow the caller to provide a custom mapper for labels (labels might not
    // map directly to a `labels.<label>` property on the resource).
    const { labels } = permission.resource.selector;
    const label_queries = Object.keys(labels)
      .map((key) => {
        return label_query_constructor(key, labels[key], labels);
      })
      .filter((query) => query);

    if (label_queries.length === 0) {
      return;
    }

    return {
      $and: [
        {
          org_id: matchIdWithWildcards(permission.resource.scope, true)
        },
        ...label_queries
      ]
    };
  };

export const createOrgScopedFilterQueryFromPermissionSet = <T>(
  permissions: cardinal.Permission[],
  params: {
    models?: string[];
    actions?: string[];
    query: mongo.Filter<T>;
    map_labels?: LabelQueryConstructor;
  }
) => {
  const filters = [params.actions ? cardinal.requireAction(...params.actions) : cardinal.requireAction('read')];
  if (params.models) {
    filters.push(cardinal.requireModel(...params.models));
  }
  const filtered_permissions = cardinal.filterPermissionsBy(permissions, ...filters);

  return createFilterQueryFromPermissionSet<T>(
    filtered_permissions,
    orgScopedResourceQueryConstructor(params.map_labels) as any,
    params.query
  );
};
