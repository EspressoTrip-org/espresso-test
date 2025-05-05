import _ from 'lodash';
import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro from '@journeyapps-platform/micro';
import { MongoDB } from '../system/mongo';
import * as producer from './producer';
import * as query_utils from './utils';
import { System } from '../system';
import * as mongo from 'mongodb';
import * as bson from 'bson';
import { getPolicyIdsForUser } from './policies';
import { listPersonalTokensForUser, updateToken } from './tokens';
import { WithActor } from './utils';

export const getUser = async (mongo: MongoDB, id: string) => {
  return query_utils.getByIdOrThrow(mongo.users, id);
};

export const listUsersForOrganization = async (mongo: MongoDB, params: { org_id: string }) => {
  return mongo.users
    .find({
      org_id: params.org_id
    })
    .map(micro.mongo.toJson)
    .toArray();
};

type UpsertUserParams = {
  user: micro.db.SerializedId & cardinal.User & { suggested_roles?: string[] };
};

export const upsertUser = async (system: System, params: UpsertUserParams) => {
  const { user } = params;
  const { mongo } = system;
  const id = new bson.ObjectId(user.id);

  await mongo.users.updateOne(
    {
      _id: id
    },
    {
      $set: {
        _id: id,
        email: user.email,
        org_id: user.org_id
      }
    },
    { upsert: true }
  );

  /**
   * Evaluate requested roles (by name) and conditionally apply them
   */
  const suggested_roles = params.user.suggested_roles ?? [];
  if (suggested_roles.length > 0) {
    const filtered_roles = suggested_roles.filter((r) => {
      return [cardinal.MANAGED_ROLE.DEVELOPER, cardinal.MANAGED_ROLE.OWNER].includes(r as cardinal.MANAGED_ROLE);
    });

    const managed_roles = await mongo.roles
      .find({
        managed: true,
        org_id: user.org_id,
        name: {
          $in: filtered_roles
        }
      })
      .toArray()
      .then((roles) => roles.map(micro.mongo.toJson));

    for (const role of managed_roles) {
      await updateUserAssignment(system, {
        actor: {
          type: cardinal.ActorType.System
        },
        assignment: 'role_ids',
        assignment_id: role.id,
        id: user.id,
        op: 'add'
      });
    }
  }
};

export const updateUserAssignments = async (system: System, params: WithActor<cardinal.UpdateUserAssignments>) => {
  const user = await getUser(system.mongo, params.id);

  const update: Partial<cardinal.User> = {};
  if (params.role_ids) {
    update.role_ids = params.role_ids;
  }
  if (params.policy_ids) {
    update.policy_ids = params.policy_ids;
  }

  await system.mongo.users.updateOne(
    {
      _id: new bson.ObjectId(params.id)
    },
    {
      $set: update
    }
  );

  const new_user = {
    ...user,
    ...update
  };

  await producer.produceAuthEvents(system, {
    actor: params.actor,
    events: [
      {
        type: cardinal.UserAuthEventType.USER_ASSIGNMENTS_CHANGED,
        payload: micro.mongo.toJson(new_user)
      }
    ]
  });

  return new_user;
};

type UpdateUserAssignmentParams = {
  id: string;
  op: 'add' | 'remove';
  assignment: 'policy_ids' | 'role_ids';
  assignment_id: string;
};

export const updateUserAssignment = async (system: System, params: WithActor<UpdateUserAssignmentParams>) => {
  const user = await getUser(system.mongo, params.id);
  const new_user = { ...user };

  const update: mongo.UpdateFilter<cardinal.User> = {};
  switch (params.op) {
    case 'add': {
      if (user[params.assignment]?.includes(params.assignment_id)) {
        return user;
      }
      update.$push = {
        [params.assignment]: params.assignment_id
      };
      new_user[params.assignment] = (new_user[params.assignment] || []).concat([params.assignment_id]);
      break;
    }
    case 'remove': {
      if (!user[params.assignment]?.includes(params.assignment_id)) {
        return user;
      }
      update.$pull = {
        [params.assignment]: params.assignment_id
      };
      new_user[params.assignment] = (new_user[params.assignment] || []).filter((id) => id !== params.assignment_id);
      break;
    }
  }

  await system.mongo.users.updateOne(
    {
      _id: new bson.ObjectId(params.id)
    },
    update
  );

  await producer.produceAuthEvents(system, {
    actor: params.actor,
    events: [
      {
        type: cardinal.UserAuthEventType.USER_ASSIGNMENTS_CHANGED,
        payload: micro.mongo.toJson(new_user)
      }
    ]
  });

  const tokens = await listPersonalTokensForUser(system.mongo, { user_id: params.id });

  // if the user has associated tokens, make sure the policies in each token intersects with the users complete set of policies
  if (tokens.length > 0) {
    const policy_ids = await getPolicyIdsForUser(system, { user: new_user });
    for (let token of tokens) {
      let policies = _.intersection(token.policy_ids, policy_ids);
      if (!_.isEqual(policies, token.policy_ids)) {
        await updateToken(system, {
          actor: params.actor,
          token: {
            ...token,
            policy_ids: policies
          }
        });
      }
    }
  }

  return new_user;
};

export const deleteUser = async (mongo: MongoDB, id: string) => {
  await mongo.users.deleteOne({
    _id: bson.ObjectId.createFromHexString(id)
  });
};
