import { beforeAll, beforeEach, afterAll, describe, test, expect } from 'vitest';

import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as routes from '../src/router/routes/v2/query';
import { System } from '../src/system/index';
import * as auth from '../src/auth/index';
import * as api from '../src/api/index';
import * as mocks from './mocks/index';
import * as bson from 'bson';

let system: System;

const org_id = '5f2ab36c60d2294576efa646';

beforeAll(async () => {
  system = await mocks.createMockedSystem();
  await system.start();

  await api.organization.upsertOrganization(system, {
    org: {
      id: org_id,
      name: 'test org'
    }
  });
});

afterAll(async () => {
  await system.stop();
});

beforeEach(async () => {
  // @ts-ignore
  await system.mongo.policies.deleteMany({});
  await system.mongo.users.deleteMany({});
});

describe('auth', () => {
  const policy_id = new bson.ObjectId('5e6f5519ede3631176831f4c');
  const now = new Date('2020-03-20T12:31:48.370Z');

  const policy: cardinal.PolicyResource = {
    _id: policy_id,
    name: 'Policy',
    description: 'Some Policy',
    org_id: org_id,
    statements: [],
    created_at: now,
    updated_at: now
  };

  test('can read policies assigned to user', async () => {
    await system.mongo.policies.insertOne(policy);

    const user_id = new bson.ObjectId();
    const user = await system.mongo.users.insertOne({
      _id: user_id,

      email: 'test-user@journeyapps.com',
      policy_ids: [policy_id.toHexString()],
      role_ids: [],
      org_id: org_id
    });

    await system.resolver.init();

    const res = await routes.policies_for_user.handler(
      mocks.createMockedPayload({
        system,
        policies: auth.canReadOwnPolicies({
          policies: await api.policies.getPoliciesForUser(system, { user_id: user_id.toHexString() }),
          model: 'user',
          id: user_id.toHexString(),
          scope: org_id
        }),
        params: {
          user_id: user.insertedId.toHexString()
        }
      })
    );
    expect(res).toMatchSnapshot();
  });

  test('can read policies assigned to token', async () => {
    await system.mongo.policies.insertOne(policy);

    const token = await api.tokens.createToken(system, {
      token: {
        org_id,
        policy_ids: [policy_id.toHexString()]
      },
      actor: {
        type: cardinal.ActorType.System
      }
    });

    await system.resolver.init();

    const res = await routes.policies_for_token.handler(
      mocks.createMockedPayload({
        system,
        policies: auth.canReadOwnPolicies({
          policies: await api.policies.getPoliciesForToken(system, { token_id: token.id }),
          model: 'token',
          id: token.id,
          scope: org_id
        }),
        params: {
          token: token.value
        }
      })
    );
    expect(res).toMatchSnapshot();
  });
});
