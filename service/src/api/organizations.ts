import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro from '@journeyapps-platform/micro';
import * as producer from './producer';
import * as policies from './policies';
import * as tokens from './tokens';
import { System } from '../system';
import * as roles from './roles';
import * as users from './users';
import * as auth from '../auth';
import * as bson from 'bson';

type PolicyProvisionParams = {
  org_id: string;
};

export const provisionStandardPoliciesAndRolesForOrg = async (system: System, params: PolicyProvisionParams) => {
  const actor: cardinal.SystemActor = {
    type: cardinal.ActorType.System
  };

  const generated_policies = auth.createDefaultPoliciesForOrg(params.org_id);
  const new_policies = await Promise.all(
    Object.values(generated_policies).map((policy) => {
      return policies.createPolicy(system, {
        actor: actor,
        policy: {
          ...policy,
          managed: true
        }
      });
    })
  );

  const policy_map = new_policies.reduce((acc: auth.CreateDefaultRolesPolicyMap, policy) => {
    acc[policy.name as auth.MANAGED_POLICY] = policy.id;
    return acc;
  }, {});

  const generated_roles = auth.createDefaultRolesForOrg(params.org_id, policy_map);
  return await Promise.all(
    generated_roles.map((role) => {
      return roles.createRole(system, {
        actor,
        role: {
          ...role,
          managed: true
        }
      });
    })
  );
};

type EmitInvalidationEventParams = {
  org: micro.db.SerializedId & cardinal.Organization;
};

/**
 * Emit user assignment changed events which act as cache invalidation events.
 */
export const emitInvalidationEvents = async (system: System, params: EmitInvalidationEventParams) => {
  const org_users = await users.listUsersForOrganization(system.mongo, {
    org_id: params.org.id
  });

  await producer.produceAuthEvents(system, {
    actor: {
      type: cardinal.ActorType.System
    },
    events: org_users.map((user) => {
      return {
        type: cardinal.UserAuthEventType.USER_ASSIGNMENTS_CHANGED,
        payload: user
      };
    })
  });
};

type UpsertOrganizationParams = {
  org: micro.db.SerializedId & cardinal.Organization;
  created_by?: string;
};

export const upsertOrganization = async (system: System, params: UpsertOrganizationParams) => {
  const existing = await system.mongo.organizations.findOne(micro.mongo.getById(params.org.id));

  await system.mongo.organizations.updateOne(
    {
      _id: new bson.ObjectId(params.org.id)
    },
    {
      $set: {
        name: params.org.name,
        locked: params.org.locked
      }
    },
    { upsert: true }
  );

  if (existing) {
    const locked_changed = params.org.locked !== existing.locked;
    if (locked_changed) {
      await emitInvalidationEvents(system, params);
    }

    return;
  }

  const roles = await provisionStandardPoliciesAndRolesForOrg(system, {
    org_id: params.org.id
  });

  // If there is a created_by field on the event then assign the Owner role to the user who
  // created this organization
  if (!params.created_by) {
    return;
  }

  try {
    const user = await users.getUser(system.mongo, params.created_by);
    const owner_role = roles.find((role) => role.name === cardinal.MANAGED_ROLE.OWNER);
    if (!owner_role) {
      return;
    }

    await users.updateUserAssignment(system, {
      actor: {
        type: cardinal.ActorType.System
      },
      assignment: 'role_ids',
      assignment_id: owner_role.id,
      id: user.id,
      op: 'add'
    });
  } catch (e) {
    micro.logger.error(`user ${params.created_by} (creator of org) could not be found`);
  }
};

export const deleteOrganization = async (system: System, params: { id: string }) => {
  await system.mongo.organizations.deleteOne({
    _id: new bson.ObjectId(params.id)
  });

  const all_policies = await policies.listScopedPoliciesForOrganization(system.mongo, {
    org_id: params.id
  });
  const all_roles = await roles.listRolesByOrganization(system.mongo, {
    org_id: params.id
  });
  const all_tokens = await tokens.listScopedTokensForOrganization(system.mongo, {
    org_id: params.id
  });

  // This is a pretty inefficient way to clean up but org deletion will be very in-frequent
  // and as such this is a nice way to re-use already tested logic to do the cleanup

  for (const token of all_tokens) {
    await tokens.deleteToken(system, {
      actor: {
        type: cardinal.ActorType.System
      },
      id: token.id
    });
  }

  for (const role of all_roles) {
    await roles.deleteRole(system, {
      actor: {
        type: cardinal.ActorType.System
      },
      id: role.id
    });
  }

  for (const policy of all_policies) {
    await policies.deletePolicy(system, {
      actor: {
        type: cardinal.ActorType.System
      },
      id: policy.id
    });
  }
};
