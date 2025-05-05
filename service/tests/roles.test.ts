import { beforeAll, afterEach, afterAll, describe, test, expect } from 'vitest';

import * as cardinal from '@journeyapps-platform/types-cardinal';
import { System } from '../src/system';
import * as auth from '../src/auth';
import * as api from '../src/api';
import * as mocks from './mocks';
import * as utils from './utils';
import * as bson from 'bson';
import { AppModelAction, CardinalModel, RoleModelAction } from '@journeyapps-platform/cardinal-catalog';

let system: System;

beforeAll(async () => {
  system = await mocks.createMockedSystem();
  await system.start();
});

afterEach(() => {
  (system.producer as any).clear();
});

afterAll(async () => {
  await system.stop();
});

describe('roles', () => {
  describe('role-crud', () => {
    test('should list roles by scope', async () => {
      await api.roles.createRole(system, {
        actor: cardinal.SYSTEM_ACTOR,
        role: {
          name: 'developer',
          org_id: '123',
          policy_ids: []
        }
      });

      const roles = await api.roles.listRolesByOrganization(system.mongo, {
        org_id: '123'
      });
      expect(utils.removeVolatile(roles)).toMatchSnapshot();
    });

    test('should successfully update a role', async () => {
      const role = await api.roles.createRole(system, {
        actor: cardinal.SYSTEM_ACTOR,
        role: {
          name: 'developer',
          org_id: '123',
          policy_ids: []
        }
      });

      await api.roles.updateRole(system, {
        actor: cardinal.SYSTEM_ACTOR,
        role: {
          ...role,
          name: 'Updated Role'
        }
      });

      const updated_role = await api.roles.getRole(system.mongo, role.id);
      expect(utils.removeVolatile(updated_role)).toMatchSnapshot();
      expect(utils.getEvents(system)).toMatchSnapshot();
    });

    test('deleting a role should update user assignments', async () => {
      const role = await api.roles.createRole(system, {
        actor: cardinal.SYSTEM_ACTOR,
        role: {
          name: 'developer',
          org_id: '123',
          policy_ids: []
        }
      });

      const now = new Date();
      const remaining_role_id = '5e6f5519ede3631176831f4c';
      await system.mongo.roles.insertOne({
        _id: new bson.ObjectId(remaining_role_id),
        name: 'dangling',
        org_id: '123',
        policy_ids: [],
        created_at: now,
        updated_at: now
      });

      const user = await system.mongo.users.insertOne({
        _id: new bson.ObjectId(),

        org_id: '123',
        email: 'test@journeyapps.com',
        role_ids: [role.id, remaining_role_id]
      });

      await api.roles.deleteRole(system, {
        actor: cardinal.SYSTEM_ACTOR,
        id: role.id
      });

      const updated_user = await system.mongo.users.findOne({
        _id: user.insertedId
      });

      expect(updated_user?.role_ids?.length).toBe(1);
      expect(updated_user?.role_ids?.[0]).toBe(remaining_role_id);

      expect(utils.getEvents(system)).toMatchSnapshot();
    });
  });

  describe('role-auth', () => {
    test('should be unauthorized to create role [operation]', async () => {
      const role: cardinal.Role = {
        policy_ids: [],
        name: 'role',
        org_id: '123'
      };

      const context = mocks.createMockedContext(system, []);

      const res = await auth.roles.authorizedToCreateRole({ params: role, context });
      expect(res.authorized).toBeFalsy();
    });

    const common_policy: cardinal.Policy = {
      org_id: '123',
      statements: [
        {
          actions: [AppModelAction.READ],
          resources: [
            {
              scope: '123',
              selector: {
                model: CardinalModel.APP,
                id: '*'
              }
            }
          ]
        }
      ]
    };

    const create_permission: cardinal.Policy = {
      statements: [
        {
          actions: [RoleModelAction.CREATE],
          resources: [
            {
              scope: '123',
              selector: {
                model: CardinalModel.ROLE,
                id: '*'
              }
            }
          ]
        }
      ]
    };

    const read_permission: cardinal.Policy = {
      statements: [
        {
          actions: [AppModelAction.READ],
          resources: [
            {
              scope: '*',
              selector: {
                model: CardinalModel.APP,
                id: '*'
              }
            }
          ]
        }
      ]
    };

    test('should be authorized to create role [operation]', async () => {
      const role: cardinal.Role = {
        policy_ids: [],
        name: 'role',
        org_id: '123'
      };

      const context = mocks.createMockedContext(system, [create_permission]);

      const res = await auth.roles.authorizedToCreateRole({ params: role, context });
      expect(res.authorized).toBeTruthy();
    });

    test('should be unauthorized to create role [scope]', async () => {
      const policy = await api.policies.createPolicy(system, {
        actor: cardinal.SYSTEM_ACTOR,
        policy: {
          ...common_policy,
          org_id: undefined
        }
      });
      const role: cardinal.Role = {
        policy_ids: [policy.id],
        name: 'role',
        org_id: '123'
      };

      const context = mocks.createMockedContext(system, [create_permission, read_permission]);

      const res = await auth.roles.authorizedToCreateRole({ params: role, context });
      expect(res.authorized).toBeFalsy();
    });

    test('should be unauthorized to create role [policy/role scope mismatch]', async () => {
      const policy = await api.policies.createPolicy(system, {
        actor: cardinal.SYSTEM_ACTOR,
        policy: {
          ...common_policy,
          org_id: '1234'
        }
      });
      const role: cardinal.Role = {
        policy_ids: [policy.id],
        name: 'role',
        org_id: '123'
      };

      const context = mocks.createMockedContext(system, [create_permission, read_permission]);

      const res = await auth.roles.authorizedToCreateRole({ params: role, context });
      expect(res.authorized).toBeFalsy();
    });

    test('should be unauthorized to create role [policies]', async () => {
      const policy = await api.policies.createPolicy(system, {
        actor: cardinal.SYSTEM_ACTOR,
        policy: common_policy
      });
      const role: cardinal.Role = {
        policy_ids: [policy.id],
        name: 'role',
        org_id: '123'
      };

      const context = mocks.createMockedContext(system, [create_permission]);

      const res = await auth.roles.authorizedToCreateRole({ params: role, context });
      expect(res.authorized).toBeFalsy();
    });

    test('should be authorized to create role [policies]', async () => {
      const policy = await api.policies.createPolicy(system, {
        actor: cardinal.SYSTEM_ACTOR,
        policy: common_policy
      });
      const role: cardinal.Role = {
        policy_ids: [policy.id],
        name: 'role',
        org_id: '123'
      };

      const context = mocks.createMockedContext(system, [create_permission, read_permission]);

      const res = await auth.roles.authorizedToCreateRole({ params: role, context });
      expect(res.authorized).toBeTruthy();
    });
  });
});
