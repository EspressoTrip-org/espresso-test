import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import * as cardinal from '@journeyapps-platform/types-cardinal';
import { System } from '../src/system';
import * as api from '../src/api';
import * as mocks from './mocks';
import * as utils from './utils';
import * as bson from 'bson';

let system: System;

beforeEach(async () => {
  system = await mocks.createMockedSystem();
  await system.start();
});

afterEach(async () => {
  await system.stop();
});

describe('policies', () => {
  test('should generate policies for upserted organization', async () => {
    const id = '5e6f5519ede3631176831f4c';
    await api.organization.upsertOrganization(system, {
      org: {
        id: id,
        name: 'test-org'
      }
    });

    const policies = await api.policies.listScopedPoliciesForOrganization(system.mongo, {
      org_id: id
    });
    expect(utils.removeVolatile(policies)).toMatchSnapshot();

    const roles = await api.roles.listRolesByOrganization(system.mongo, {
      org_id: id
    });
    const modified_roles = roles.map((role) => {
      return {
        ...role,
        policy_ids: role.policy_ids?.length
      };
    });
    expect(utils.removeVolatile(modified_roles)).toMatchSnapshot();

    // ensure idempotent
    const events = utils
      .getEvents(system)
      .sort(utils.sortByName)
      .map((event) => {
        if (event.type === cardinal.RoleAuthEventType.ROLE_CREATED) {
          return {
            type: event.type,
            payload: {
              ...event.payload,
              policy_ids: (event.payload as any)?.policy_ids?.length
            }
          };
        }
        return event;
      });
    expect(events).toMatchSnapshot();
  });

  test('deleting an org should clean up all associated resources', async () => {
    const id = '5e6f5519ede3631176831f4c';
    const user_id = '5e6f5519ede3631176831f4d';

    await api.organization.upsertOrganization(system, {
      org: {
        id: id,
        name: 'test-org'
      }
    });

    // scoped token
    await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: {
        org_id: id,
        description: 'test-token',
        policy_ids: []
      }
    });

    // user token
    await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: {
        org_id: id,
        user_id: user_id,
        description: 'test-token-user',
        policy_ids: []
      }
    });

    (system.producer as any).clear();

    await api.organization.deleteOrganization(system, {
      id: id
    });

    const policies = await api.policies.listScopedPoliciesForOrganization(system.mongo, {
      org_id: id
    });
    const roles = await api.roles.listRolesByOrganization(system.mongo, {
      org_id: id
    });
    const tokens = await api.tokens.listScopedTokensForOrganization(system.mongo, {
      org_id: id
    });

    expect(policies.length).toBe(0);
    expect(roles.length).toBe(0);
    expect(tokens.length).toBe(0);

    // ensure idempotent
    const events = utils
      .getEvents(system)
      .sort(utils.sortByName)
      .map((event) => {
        if (event.type === cardinal.RoleAuthEventType.ROLE_DELETED) {
          return {
            type: event.type,
            payload: {
              ...event.payload,
              policy_ids: (event.payload as any)?.policy_ids?.length
            }
          };
        }
        return event;
      });
    expect(events).toMatchSnapshot();
  });

  test('locking an org should emit invalidation events', async () => {
    const id = '5e6f5519ede3631176831f4c';
    await api.organization.upsertOrganization(system, {
      org: {
        id: id,
        name: 'test-org',
        locked: false
      }
    });

    const user_id = '5e6f5519ede3631176831f5c';

    await system.mongo.users.insertOne({
      _id: bson.ObjectId.createFromHexString(user_id),
      org_id: id,
      email: 'test@example.com'
    });

    (system.producer as any).clear();

    await api.organization.upsertOrganization(system, {
      org: {
        id: id,
        name: 'test-org',
        locked: true
      }
    });

    expect(utils.getEvents(system)).toMatchSnapshot();

    (system.producer as any).clear();

    await api.organization.upsertOrganization(system, {
      org: {
        id: id,
        name: 'test-org',
        locked: true
      }
    });

    expect(utils.getEvents(system).length).toBe(0);
  });
});
