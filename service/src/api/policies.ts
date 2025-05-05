import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro from '@journeyapps-platform/micro';
import * as compilation from './compilation';
import { stripTokenValue } from './tokens';
import { MongoDB } from '../system/mongo';
import * as producer from './producer';
import * as query_utils from './utils';
import * as crypto from 'node:crypto';
import { System } from '../system';
import * as tokens from './tokens';
import * as mongo from 'mongodb';
import * as users from './users';
import * as roles from './roles';
import * as auth from '../auth';
import * as bson from 'bson';
import { CardinalModel } from '@journeyapps-platform/cardinal-catalog';
import { WithActor } from './utils';

export const getPolicy = async (mongo: MongoDB, id: string) => {
  return query_utils.getByIdOrThrow(mongo.policies, id);
};

type CreatePolicyParams = WithActor<{
  policy: cardinal.Policy & cardinal.Managed;
}>;

export const createPolicy = async (system: System, params: CreatePolicyParams) => {
  const { policy } = params;

  const now = new Date();

  const id = new bson.ObjectId();
  await system.mongo.policies.insertOne({
    _id: id,
    description: policy.description,
    org_id: policy.org_id,
    name: policy.name,
    statements: policy.statements,
    managed: policy.managed,
    created_at: now,
    updated_at: now
  });

  const new_policy = cardinal.PolicyResource.encode({
    _id: id,
    ...policy,
    created_at: now,
    updated_at: now
  });

  await producer.produceAuthEvents(system, {
    actor: params.actor,
    events: {
      type: cardinal.PolicyAuthEventType.POLICY_CREATED,
      payload: new_policy
    }
  });

  return new_policy;
};

export type UpdatePolicyParams = WithActor<{
  policy: cardinal.Managed & cardinal.UpdatePolicyParams;
}>;

export const updatePolicy = async (system: System, params: UpdatePolicyParams) => {
  const { policy } = params;

  const existing_policy = await getPolicy(system.mongo, params.policy.id);

  const now = new Date();
  const update = {
    name: policy.name,
    description: policy.description,
    statements: policy.statements,
    updated_at: now
  };

  await system.mongo.policies.updateOne(
    {
      _id: new bson.ObjectId(policy.id)
    },
    {
      $set: update
    }
  );

  const new_policy = {
    ...existing_policy,
    ...update
  };

  await producer.produceAuthEvents(system, {
    actor: params.actor,
    events: {
      type: cardinal.PolicyAuthEventType.POLICY_UPDATED,
      payload: micro.mongo.toJson(new_policy)
    }
  });

  return new_policy;
};

export const getPolicyAssignments = async (mongo: MongoDB, id: string) => {
  const policy = await getPolicy(mongo, id);

  const filter = {
    policy_ids: {
      $in: [policy.id]
    }
  };

  const users = await mongo.users.find(filter).toArray();
  const tokens = await mongo.tokens.find(filter).toArray();
  const roles = await mongo.roles.find(filter).toArray();

  return {
    users: users,
    tokens: tokens.map(stripTokenValue),
    roles: roles
  };
};

export const deletePolicy = async (system: System, params: WithActor<{ id: string }>) => {
  const policy = await getPolicy(system.mongo, params.id);

  const filter: mongo.Filter<{ policy_ids?: string[] }> = {
    policy_ids: {
      $in: [policy.id]
    }
  };

  // We first find all resources with associations so that we can emit
  // events for them changing
  const { users, tokens, roles } = await getPolicyAssignments(system.mongo, params.id);

  await system.mongo.policies.deleteOne({
    _id: new bson.ObjectId(params.id)
  });

  const update: mongo.UpdateFilter<{ policy_ids: string[] }> = {
    $pull: {
      policy_ids: policy.id
    }
  };

  // Update all associated resources, removing the policy id from their
  // set
  await system.mongo.users.updateMany(filter, update);
  await system.mongo.tokens.updateMany(filter, update);
  await system.mongo.roles.updateMany(filter, update);

  const user_auth_events: cardinal.AuthEvent[] = users.map(micro.mongo.toJson).map((user) => {
    return {
      type: cardinal.UserAuthEventType.USER_ASSIGNMENTS_CHANGED,
      payload: {
        ...user,
        policy_ids: user.policy_ids?.filter((id) => id !== policy.id)
      }
    };
  });

  const token_auth_events: cardinal.AuthEvent[] = tokens.map(micro.mongo.toJson).map((token) => {
    return {
      type: cardinal.TokenAuthEventType.TOKEN_UPDATED,
      payload: {
        ...token,
        policy_ids: token.policy_ids?.filter((id) => id !== policy.id)
      }
    };
  });

  const role_auth_events: cardinal.AuthEvent[] = roles.map(micro.mongo.toJson).map((role) => {
    return {
      type: cardinal.RoleAuthEventType.ROLE_UPDATED,
      payload: {
        ...role,
        policy_ids: role.policy_ids?.filter((id) => id !== policy.id)
      }
    };
  });

  const auth_events = user_auth_events
    .concat(token_auth_events)
    .concat(role_auth_events)
    .concat([
      {
        type: cardinal.PolicyAuthEventType.POLICY_DELETED,
        payload: micro.mongo.toJson(policy)
      }
    ]);

  await producer.produceAuthEvents(system, {
    actor: params.actor,
    events: auth_events
  });
};

export const listUnscopedPolicies = (mongo: MongoDB) => {
  return mongo.policies
    .find({
      org_id: {
        $exists: false
      }
    })
    .map(micro.mongo.toJson)
    .toArray();
};

type ListScopedPoliciesForOrganizationParams = {
  org_id: string;
};

export const listScopedPoliciesForOrganization = async (
  mongo: MongoDB,
  params: ListScopedPoliciesForOrganizationParams
) => {
  return await mongo.policies
    .find({
      org_id: params.org_id
    })
    .map(micro.mongo.toJson)
    .toArray();
};

export const listPolicies = async (
  system: System,
  params: query_utils.RequirePermissions<cardinal.V2ListResourceParams>
) => {
  const query = await query_utils.wrapQueryWithPermissions(system, {
    ...params,

    query: micro.mongo.findBy<cardinal.PolicyResource>({
      id: params.id,
      org_id: params.org_id
    }),
    model: CardinalModel.POLICY
  });

  return await micro.mongo.paginate(system.mongo.policies, {
    query: query,
    cursor: params.cursor,
    limit: params.limit || 100,
    transform: micro.mongo.toJson
  });
};

export const getPoliciesByIds = async (mongo: MongoDB, ids: string[]): Promise<cardinal.SerializedPolicyResource[]> => {
  return mongo.policies.find(micro.mongo.getByIds(ids)).map(micro.mongo.toJson).toArray();
};

export const getPolicyIdsForUser = async (
  system: System,
  params: { user: cardinal.SerializedUserResource }
): Promise<string[]> => {
  const { user } = params;
  const user_roles = user?.role_ids ? await roles.getRoles(system.mongo, user.role_ids) : [];
  return user_roles.reduce((ids: string[], role) => {
    ids.push(...(role.policy_ids || []));
    return ids;
  }, user.policy_ids || []);
};

export const getPoliciesForUser = (system: System, params: query_utils.OptionalPermissions<{ user_id: string }>) => {
  return micro.tracing.trace('get-policies-for-user', async (span) => {
    const mongo = system.mongo;

    const user = await users.getUser(mongo, params.user_id);
    const organization = await mongo.organizations.findOne(micro.mongo.getById(user.org_id));

    if (!organization) {
      throw new micro.errors.ResourceNotFound('organization', user.org_id);
    }

    if (organization.locked) {
      const policy = auth.createLockedPolicy(organization._id.toHexString());
      return [policy];
    }

    let requested_policy_ids = await getPolicyIdsForUser(system, { user });
    let policy_ids = requested_policy_ids;
    if (params.policies) {
      policy_ids = await system.resolver.resolveResourceIds({
        policies: params.policies,
        model: CardinalModel.POLICY,
        entity_filter: {
          id: requested_policy_ids
        }
      });
    }

    const hash = crypto.createHash('sha256');
    hash.update(user.id);
    hash.update(policy_ids.join(''));
    const key = hash.digest('hex');

    const cache_hit = await system.policy_cache.get(key);
    span.setAttribute('cached', !!cache_hit);
    if (cache_hit) {
      return cache_hit;
    }

    const locked_orgs = await micro.tracing.trace('fetch-locked-orgs', async () => {
      const org_ids = await mongo.policies
        .find({
          $and: [
            micro.mongo.getByIds(policy_ids),
            {
              org_id: {
                $exists: true
              }
            }
          ]
        })
        .project<{ org_id: string }>({
          org_id: 1
        })
        .map((policy) => new bson.ObjectId(policy.org_id))
        .toArray();

      return mongo.organizations
        .find({
          _id: {
            $in: org_ids
          },
          locked: true
        })
        .project<{ _id: bson.ObjectId }>({
          _id: 1
        })
        .map((org) => org._id.toHexString())
        .toArray();
    });

    return await micro.tracing.trace('collect-policies', async () => {
      const policies = await mongo.policies
        .find({
          $and: [
            micro.mongo.getByIds(policy_ids),
            {
              org_id: {
                $nin: locked_orgs
              }
            }
          ]
        })
        .project<{ _id: bson.ObjectId; org_id: string; statements: cardinal.PolicyStatement[] }>({
          _id: 1,
          org_id: 1,
          statements: 1
        })
        .map(({ _id, ...policy }) => {
          const _policy = {
            id: _id.toHexString(),
            ...policy
          };
          return compilation.interpolateTemplatePolicy(_policy, {
            actor: {
              id: user.id,
              type: cardinal.ActorType.User,
              org_id: user.org_id
            }
          });
        })
        .toArray();

      await system.policy_cache.set(key, policies);

      return policies;
    });
  });
};

export const getPoliciesForToken = (system: System, params: query_utils.OptionalPermissions<{ token_id: string }>) => {
  return micro.tracing.trace('get-policies-for-token', async () => {
    const token = await tokens.getToken(system.mongo, params.token_id);

    /**
     * If the token is a scoped token, check to see if the organization it belongs to is
     * locked.
     *
     * If it is locked then we don't return policies for the token
     */
    if (token.org_id) {
      const organization = await system.mongo.organizations.findOne(micro.mongo.getById(token.org_id));

      if (!organization) {
        throw new micro.errors.ResourceNotFound('organization', token.org_id);
      }

      if (organization.locked) {
        return [];
      }
    }

    let policy_ids = token.policy_ids || [];
    if (params.policies && token.policy_ids) {
      policy_ids = await system.resolver.resolveResourceIds({
        policies: params.policies,
        model: CardinalModel.POLICY,
        entity_filter: {
          id: token.policy_ids
        }
      });
    }

    if (policy_ids.length > 0) {
      return await micro.tracing.trace('collect-policies', () => {
        return system.mongo.policies
          .find(micro.mongo.getByIds(policy_ids))
          .project<{ _id: bson.ObjectId; statements: cardinal.PolicyStatement[] }>({
            _id: 1,
            org_id: 1,
            statements: 1
          })
          .map(({ _id, ...policy }) => {
            const _policy = {
              id: _id.toHexString(),
              ...policy
            };
            return compilation.interpolateTemplatePolicy(_policy, {
              actor: {
                id: token.id,
                type: cardinal.ActorType.Token,
                org_id: token.org_id
              }
            });
          })
          .toArray();
      });
    }

    return [];
  });
};
