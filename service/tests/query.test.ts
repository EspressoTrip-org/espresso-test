import { beforeAll, beforeEach, afterAll, describe, test, expect } from 'vitest';

import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as routes from '../src/router/routes/v2/query';
import { System } from '../src/system';
import * as api from '../src/api';
import * as mocks from './mocks';
import * as bson from 'bson';
import { CardinalModel, PolicyModelAction } from '@journeyapps-platform/cardinal-catalog';

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

describe('policy queries', () => {
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

  const policies: cardinal.Policy[] = [
    {
      statements: [
        {
          actions: [PolicyModelAction.READ],
          resources: [
            {
              scope: '*',
              selector: {
                model: CardinalModel.POLICY,
                id: '*'
              }
            }
          ]
        },
        {
          actions: [PolicyModelAction.READ],
          resources: [
            {
              selector: {
                model: CardinalModel.POLICY,
                id: '*'
              }
            }
          ]
        }
      ]
    }
  ];

  test('return policies for user', async () => {
    await system.mongo.policies.insertOne(policy);

    const user = await system.mongo.users.insertOne({
      _id: new bson.ObjectId(),

      email: 'test-user@journeyapps.com',
      policy_ids: [policy_id.toHexString()],
      role_ids: [],
      org_id: org_id
    });

    await system.resolver.init();

    const res = await routes.policies_for_user.handler(
      mocks.createMockedPayload({
        system,
        policies,
        params: {
          user_id: user.insertedId.toHexString()
        }
      })
    );
    expect(res).toMatchSnapshot();
  });

  test('policy statements should be interpolated on request', async () => {
    await system.mongo.policies.insertOne({
      ...policy,
      statements: [
        {
          actions: ['read'],
          resources: [
            {
              scope: policy.org_id,
              selector: {
                model: 'draft',
                id: '*',
                parents: [
                  {
                    model: 'user',
                    id: '$actor.id'
                  }
                ]
              }
            }
          ]
        }
      ]
    });

    const user_id = new bson.ObjectId('5e6f5519ede3631176832f4a');
    await system.mongo.users.insertOne({
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
        policies,
        params: {
          user_id: user_id.toHexString()
        }
      })
    );
    expect(res).toMatchSnapshot();
  });

  test('return policies for user, filtering out those for locked orgs', async () => {
    // Fixtures we want returned
    await system.mongo.policies.insertOne(policy);

    // Fixtures we want filtered out.
    const locked_org_id = '5f2ab78a678d1d478d17e5cf';
    await api.organization.upsertOrganization(system, {
      org: {
        id: locked_org_id,
        locked: true,
        name: 'Locked Org'
      }
    });

    const locked_org_policy_id = new bson.ObjectId('5f3d63ce7a73979876d9c4d9');
    await system.mongo.policies.insertOne({
      _id: locked_org_policy_id,
      name: 'Policy',
      description: 'Some Policy for Locked Org',
      org_id: locked_org_id,
      statements: [],
      created_at: now,
      updated_at: now
    });

    const unscoped_policy_id = new bson.ObjectId('5f3d63ce7a73979876d9c4c7');
    await system.mongo.policies.insertOne({
      _id: unscoped_policy_id,
      name: 'Unscoped Policy',
      description: 'An unscoped policy',
      statements: [],
      created_at: now,
      updated_at: now
    });

    const user = await system.mongo.users.insertOne({
      _id: new bson.ObjectId(),

      email: 'test-user@journeyapps.com',
      policy_ids: [policy_id.toHexString(), locked_org_policy_id.toHexString(), unscoped_policy_id.toHexString()],
      role_ids: [],
      org_id: org_id
    });

    await system.resolver.init();

    const res = await routes.policies_for_user.handler(
      mocks.createMockedPayload({
        system,
        policies,
        params: {
          user_id: user.insertedId.toHexString()
        }
      })
    );
    expect(res).toMatchSnapshot();
  });

  test('return locked policy for user when org is locked', async () => {
    await system.mongo.policies.insertOne(policy);

    const org_id = '5f2ab78a678d1d478d17e5cf';
    await api.organization.upsertOrganization(system, {
      org: {
        id: org_id,
        locked: true,
        name: 'Locked Org'
      }
    });
    const user = await system.mongo.users.insertOne({
      _id: new bson.ObjectId(),

      email: 'test-user@journeyapps.com',
      policy_ids: [policy_id.toHexString()],
      role_ids: [],
      org_id: org_id
    });

    await system.resolver.init();

    const res = await routes.policies_for_user.handler(
      mocks.createMockedPayload({
        system,
        policies,
        params: {
          user_id: user.insertedId.toHexString()
        }
      })
    );

    expect(res).toMatchSnapshot();
  });

  test('return no policies for user due to permissions', async () => {
    await system.mongo.policies.insertOne(policy);

    const user = await system.mongo.users.insertOne({
      _id: new bson.ObjectId(),

      email: 'test-user@journeyapps.com',
      policy_ids: [policy_id.toHexString()],
      role_ids: [],
      org_id: org_id
    });

    await system.resolver.init();

    const res = await routes.policies_for_user.handler(
      mocks.createMockedPayload({
        system,
        policies: [],
        params: {
          user_id: user.insertedId.toHexString()
        }
      })
    );
    expect(res).toMatchSnapshot();
  });

  test('return policies for token', async () => {
    await system.mongo.policies.insertOne(policy);
    const token = await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: {
        description: 'test token',
        org_id: policy.org_id,
        policy_ids: [policy_id.toHexString()]
      }
    });

    await system.resolver.init();

    const res = await routes.policies_for_token.handler(
      mocks.createMockedPayload({
        system,
        policies,
        params: {
          token: token.value
        }
      })
    );
    expect(res).toMatchSnapshot();
  });

  test('return no policies for token belonging to locked organizations', async () => {
    await system.mongo.policies.insertOne(policy);

    const org_id = '5f2ab78a678d1d478d17e1a6';
    await api.organization.upsertOrganization(system, {
      org: {
        id: org_id,
        locked: true,
        name: 'Locked Org'
      }
    });

    const token = await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: {
        description: 'test token',
        org_id: org_id,
        policy_ids: [policy_id.toHexString()]
      }
    });

    await system.resolver.init();

    const res = await routes.policies_for_token.handler(
      mocks.createMockedPayload({
        system,
        policies,
        params: {
          token: token.value
        }
      })
    );
    expect(res.length).toBe(0);
  });
});
