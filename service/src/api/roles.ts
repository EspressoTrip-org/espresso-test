import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro from '@journeyapps-platform/micro';
import { MongoDB } from '../system/mongo';
import * as producer from './producer';
import * as query_utils from './utils';
import { System } from '../system';
import * as bson from 'bson';
import { CardinalModel } from '@journeyapps-platform/cardinal-catalog';
import { RoleResource } from '@journeyapps-platform/types-cardinal';
import { WithActor } from './utils';

export const getRole = (mongo: MongoDB, id: string): Promise<cardinal.SerializedRoleResource> => {
  return query_utils.getByIdOrThrow(mongo.roles, id);
};

export const getRoles = async (mongo: MongoDB, ids: string[]): Promise<cardinal.RoleResource[]> => {
  return mongo.roles.find(micro.mongo.getByIds(ids)).toArray();
};

export const listRolesByOrganization = async (mongo: MongoDB, params: { org_id: string }) => {
  return mongo.roles
    .find({
      org_id: params.org_id
    })
    .sort({
      _id: 1
    })
    .map(micro.mongo.toJson)
    .toArray();
};

export const listRoles = async (
  system: System,
  params: query_utils.RequirePermissions<cardinal.V2ListResourceParams>
) => {
  const query = await query_utils.wrapQueryWithPermissions(system, {
    ...params,
    query: micro.mongo.findBy<cardinal.RoleResource>({
      id: params.id,
      org_id: params.org_id
    }),
    model: CardinalModel.ROLE
  });

  return await micro.mongo.paginate(system.mongo.roles, {
    query: query,
    cursor: params.cursor,
    limit: params.limit || 100,
    transform: micro.mongo.toJson
  });
};

type CreateRoleParams = WithActor<{
  role: cardinal.Managed & cardinal.Role;
}>;

export const createRole = async (system: System, params: CreateRoleParams) => {
  const { role } = params;

  const now = new Date();

  const id = new bson.ObjectId();
  await system.mongo.roles.insertOne({
    _id: id,

    name: role.name,
    org_id: role.org_id,
    policy_ids: role.policy_ids,
    managed: role.managed,

    created_at: now,
    updated_at: now
  });

  const new_role = RoleResource.encode({
    created_at: now,
    updated_at: now,
    _id: id,
    ...role
  });

  await producer.produceAuthEvents(system, {
    actor: params.actor,
    events: {
      type: cardinal.RoleAuthEventType.ROLE_CREATED,
      payload: new_role
    }
  });

  return new_role;
};

type UpdateRoleParams = WithActor<{
  role: micro.db.SerializedId & Omit<cardinal.Role, 'org_id'>;
}>;

export const updateRole = async (system: System, params: UpdateRoleParams) => {
  const { role } = params;
  const existing_role = await getRole(system.mongo, role.id);

  const now = new Date();
  const update = {
    name: role.name,
    policy_ids: role.policy_ids,
    updated_at: now
  };

  await system.mongo.roles.updateOne(
    {
      _id: new bson.ObjectId(role.id)
    },
    {
      $set: update
    }
  );

  const new_role = {
    ...existing_role,
    ...update
  };

  await producer.produceAuthEvents(system, {
    actor: params.actor,
    events: {
      type: cardinal.RoleAuthEventType.ROLE_UPDATED,
      payload: micro.mongo.toJson(new_role)
    }
  });

  return new_role;
};

export const deleteRole = async (system: System, params: WithActor<{ id: string }>) => {
  const role = await getRole(system.mongo, params.id);
  await system.mongo.roles.deleteOne({
    _id: new bson.ObjectId(params.id)
  });

  const filter = {
    role_ids: {
      $in: [role.id]
    }
  };
  const users = await system.mongo.users.find(filter).toArray();
  await system.mongo.users.updateMany(filter, {
    $pull: {
      role_ids: role.id
    }
  });

  const user_auth_events: cardinal.AuthEvent[] = users.map((user) => {
    return {
      type: cardinal.UserAuthEventType.USER_ASSIGNMENTS_CHANGED,
      payload: micro.mongo.toJson({
        ...user,
        role_ids: user.role_ids?.filter((id) => id !== role.id)
      })
    };
  });

  const auth_events = user_auth_events.concat([
    {
      type: cardinal.RoleAuthEventType.ROLE_DELETED,
      payload: micro.mongo.toJson(role)
    }
  ]);

  await producer.produceAuthEvents(system, {
    actor: params.actor,
    events: auth_events
  });
};
