import { beforeAll, afterEach, afterAll, describe, test, expect } from 'vitest';

import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro from '@journeyapps-platform/micro';
import { System } from '../src/system';
import * as auth from '../src/auth';
import * as api from '../src/api';
import * as utils from './utils';
import * as mocks from './mocks';
import * as bson from 'bson';

let system: System;

beforeAll(async () => {
  system = await mocks.createMockedSystem();
  await system.start();
});

afterEach(async () => {
  await system.mongo.users.deleteMany({});
  (system.producer as any).clear();
});

afterAll(async () => {
  await system.stop();
});

describe('users', () => {
  const id = '5e6f5519ede3631176831f4c';
  const user: cardinal.UserResource = {
    _id: new bson.ObjectId(id),
    email: 'test@journeyapps.com',
    org_id: '123'
  };

  const manage_assignments_permission: cardinal.Policy = {
    statements: [
      {
        actions: ['manage-assignments'],
        resources: [
          {
            scope: '123',
            selector: {
              model: 'user',
              id: '*'
            }
          }
        ]
      }
    ]
  };

  const common_policy: cardinal.Policy = {
    org_id: '123',
    statements: [
      {
        actions: ['read'],
        resources: [
          {
            scope: '123',
            selector: {
              model: 'app',
              id: '*'
            }
          }
        ]
      }
    ]
  };

  test('should not assign org policies to user on create', async () => {
    const org_id = '5e6f5519ede3631176831f5e';
    await api.organization.upsertOrganization(system, {
      org: {
        id: org_id,
        name: 'test-org'
      }
    });

    const id_1 = '5e6f5519ede3631176831f9e';
    await api.users.upsertUser(system, {
      user: {
        id: id_1,
        org_id: org_id,
        email: 'test-1@journeyapps.com'
      }
    });

    const first_user = await api.users.getUser(system.mongo, id_1);
    const user_roles = api.roles.getRole(system.mongo, first_user.role_ids?.[0]!);

    // Should not have any roles when created
    expect(user_roles).rejects.toThrow();
  });

  test('should update user assignments', async () => {
    await api.users.upsertUser(system, {
      user: {
        id: id,
        org_id: '123',
        email: 'test@journeyapps.com'
      }
    });

    await api.users.updateUserAssignments(system, {
      actor: cardinal.SYSTEM_ACTOR,
      id: id,
      policy_ids: ['445'],
      role_ids: ['445']
    });

    const user = await system.mongo.users.findOne(micro.mongo.getById(id));

    if (!user) {
      throw new Error('invalid');
    }

    expect(utils.removeVolatile(user)).toMatchSnapshot();
    expect(utils.getEvents(system)).toMatchSnapshot();
  });

  test('should assign owner role to first user (otherwise developer role)', async () => {
    const org_id = '5e6f5519ede3631176831f5e';

    await api.organization.upsertOrganization(system, {
      org: { id: org_id, name: 'org' }
    });

    await api.users.upsertUser(system, {
      user: {
        id: id,
        org_id,
        email: 'user-a@journeyapps.com',
        suggested_roles: [cardinal.MANAGED_ROLE.OWNER]
      }
    });

    const id_2 = '5e6f5519ede3631176831f9e';
    await api.users.upsertUser(system, {
      user: {
        id: id_2,
        org_id,
        email: 'user-b@journeyapps.com',
        suggested_roles: [cardinal.MANAGED_ROLE.DEVELOPER]
      }
    });

    // Accounts hub will suggest Developer and/or Owner roles when signing up
    const orgRoles = await api.roles.listRolesByOrganization(system.mongo, { org_id });
    const ownerRole = orgRoles.find((role) => role.name == cardinal.MANAGED_ROLE.OWNER);
    const developerRole = orgRoles.find((role) => role.name == cardinal.MANAGED_ROLE.DEVELOPER);

    expect(ownerRole).toBeDefined();
    expect(developerRole).toBeDefined();

    const user = await api.users.getUser(system.mongo, id);
    const user2 = await api.users.getUser(system.mongo, id_2);

    expect(user.role_ids?.includes(ownerRole!.id)).toBeTruthy();
    expect(user2.role_ids?.includes(developerRole!.id)).toBeTruthy();
  });

  test('should update user assignments via singular API', async () => {
    await api.users.upsertUser(system, {
      user: {
        id: id,
        org_id: '123',
        email: 'test@journeyapps.com'
      }
    });

    const update1 = await api.users.updateUserAssignment(system, {
      actor: cardinal.SYSTEM_ACTOR,
      id: id,
      assignment: 'policy_ids',
      assignment_id: '445',
      op: 'add'
    });
    const user1 = await api.users.getUser(system.mongo, id);

    expect(utils.removeVolatile(update1)).toMatchSnapshot();
    expect(utils.removeVolatile(user1)).toMatchSnapshot();

    const update2 = await api.users.updateUserAssignment(system, {
      actor: cardinal.SYSTEM_ACTOR,
      id: id,
      assignment: 'policy_ids',
      assignment_id: '445',
      op: 'remove'
    });
    const user2 = await api.users.getUser(system.mongo, id);

    expect(utils.removeVolatile(update2)).toMatchSnapshot();
    expect(utils.removeVolatile(user2)).toMatchSnapshot();

    await api.users.updateUserAssignment(system, {
      actor: cardinal.SYSTEM_ACTOR,
      id: id,
      assignment: 'role_ids',
      assignment_id: '445',
      op: 'add'
    });
    const user3 = await api.users.getUser(system.mongo, id);
    expect(utils.removeVolatile(user3)).toMatchSnapshot();

    await api.users.updateUserAssignment(system, {
      actor: cardinal.SYSTEM_ACTOR,
      id: id,
      assignment: 'role_ids',
      assignment_id: '445',
      op: 'remove'
    });
    const user4 = await api.users.getUser(system.mongo, id);
    expect(utils.removeVolatile(user4)).toMatchSnapshot();

    expect(utils.getEvents(system)).toMatchSnapshot();
  });

  test('should be unauthorized to update user assignments [operation]', async () => {
    const context = mocks.createMockedContext(system, []);

    await system.mongo.users.insertOne(user);

    await system.resolver.init();

    const res = await auth.users.authorizedToUpdateUserAssociations({
      params: {
        id: id
      },
      context
    });
    expect(res.authorized).toBeFalsy();
  });

  test('should be unauthorized to update user assignments [policies]', async () => {
    const context = mocks.createMockedContext(system, [manage_assignments_permission]);

    await system.mongo.users.insertOne(user);

    const policy = await api.policies.createPolicy(system, {
      actor: cardinal.SYSTEM_ACTOR,
      policy: common_policy
    });

    await system.resolver.init();

    const res = await auth.users.authorizedToUpdateUserAssociations({
      params: {
        id: id,
        policy_ids: [policy.id]
      },
      context
    });
    expect(res.authorized).toBeFalsy();
  });

  test('should be authorized to update user assignments', async () => {
    const context = mocks.createMockedContext(system, [
      manage_assignments_permission,
      {
        statements: [
          {
            actions: ['read'],
            resources: [
              {
                scope: '123',
                selector: {
                  model: 'app',
                  id: '*'
                }
              }
            ]
          }
        ]
      }
    ]);

    await system.mongo.users.insertOne(user);

    const policy = await api.policies.createPolicy(system, {
      actor: cardinal.SYSTEM_ACTOR,
      policy: common_policy
    });

    await system.resolver.init();

    const res = await auth.users.authorizedToUpdateUserAssociations({
      params: {
        id: id,
        policy_ids: [policy.id]
      },
      context
    });
    expect(res.authorized).toBeTruthy();
  });

  test('should correctly revoke policies from pats if user assignments change', async () => {
    await api.users.upsertUser(system, {
      user: {
        id: id,
        org_id: '123',
        email: 'test@journeyapps.com'
      }
    });

    await api.users.updateUserAssignment(system, {
      actor: cardinal.SYSTEM_ACTOR,
      id: id,
      assignment: 'policy_ids',
      assignment_id: '445',
      op: 'add'
    });

    await api.users.updateUserAssignment(system, {
      actor: cardinal.SYSTEM_ACTOR,
      id: id,
      assignment: 'policy_ids',
      assignment_id: '446',
      op: 'add'
    });

    const token = await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: {
        user_id: id,
        policy_ids: ['445', '446'],
        org_id: '123'
      }
    });

    const update1 = await api.users.updateUserAssignment(system, {
      actor: cardinal.SYSTEM_ACTOR,
      id: id,
      assignment: 'policy_ids',
      assignment_id: '445',
      op: 'remove'
    });

    const token_updated = await api.tokens.getToken(system.mongo, token.id);
    expect(token_updated.policy_ids).toEqual(['446']);
  });
});
