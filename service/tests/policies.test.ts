import { beforeAll, afterEach, afterAll, describe, test, expect } from 'vitest';

import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as errors from '../src/errors';
import { System } from '../src/system';
import * as auth from '../src/auth';
import * as api from '../src/api';
import * as mocks from './mocks';
import * as utils from './utils';
import * as bson from 'bson';
import * as _ from 'lodash';
import { CardinalModel, PolicyModelAction } from '@journeyapps-platform/cardinal-catalog';

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

describe('policies', () => {
  describe('policy-crud', () => {
    test('should list policies by scope', async () => {
      await api.policies.createPolicy(system, {
        actor: cardinal.SYSTEM_ACTOR,
        policy: {
          name: 'Scoped Policy',
          statements: [],
          org_id: '123'
        }
      });

      await api.policies.createPolicy(system, {
        actor: cardinal.SYSTEM_ACTOR,
        policy: {
          name: 'Unscoped Policy',
          statements: []
        }
      });

      const scoped = await api.policies.listScopedPoliciesForOrganization(system.mongo, {
        org_id: '123'
      });
      const unscoped = await api.policies.listUnscopedPolicies(system.mongo);

      expect(utils.removeVolatile(scoped)).toMatchSnapshot();
      expect(utils.removeVolatile(unscoped)).toMatchSnapshot();
    });

    test('should successfully create a scoped policy', async () => {
      const res = await api.policies.createPolicy(system, {
        actor: cardinal.SYSTEM_ACTOR,
        policy: {
          name: 'Some policy name',
          description: 'Some policy description',
          statements: [
            {
              actions: ['create', 'read'],
              resources: [
                {
                  scope: '*',
                  selector: {
                    id: '*',
                    model: '*'
                  }
                }
              ]
            }
          ],
          org_id: '123'
        }
      });

      expect(utils.removeVolatile(res)).toMatchSnapshot();
      expect(utils.getEvents(system)).toMatchSnapshot();
    });

    test('should successfully update a policy', async () => {
      const policy = await api.policies.createPolicy(system, {
        actor: cardinal.SYSTEM_ACTOR,
        policy: {
          org_id: '123',
          statements: [],
          name: 'policy'
        }
      });

      await api.policies.updatePolicy(system, {
        actor: cardinal.SYSTEM_ACTOR,
        policy: {
          ...policy,
          name: 'Updated Policy'
        }
      });

      const updated_policy = await api.policies.getPolicy(system.mongo, policy.id);
      expect(utils.removeVolatile(updated_policy)).toMatchSnapshot();

      expect(utils.getEvents(system)).toMatchSnapshot();
    });

    test('should remove associations from related resources on delete', async () => {
      const policy = await api.policies.createPolicy(system, {
        actor: cardinal.SYSTEM_ACTOR,
        policy: {
          org_id: '123',
          statements: [],
          name: 'policy'
        }
      });

      const now = new Date();

      const remaining_policy_id = '5e6f5519ede3631176831f4c';
      await system.mongo.policies.insertOne({
        _id: new bson.ObjectId(remaining_policy_id),
        updated_at: now,
        created_at: now,
        name: 'dangling',
        org_id: '123',
        statements: []
      });

      const user = await system.mongo.users.insertOne({
        _id: new bson.ObjectId(),

        org_id: '123',
        email: 'test@journeyapps.com',
        policy_ids: [policy.id, remaining_policy_id]
      });

      const role = await system.mongo.roles.insertOne({
        _id: new bson.ObjectId(),

        name: 'test-role',
        org_id: '123',
        policy_ids: [policy.id, remaining_policy_id],
        created_at: now,
        updated_at: now
      });

      const token = await system.mongo.tokens.insertOne({
        _id: new bson.ObjectId(),

        description: 'test token',
        value: 'nothing',
        org_id: '123',
        policy_ids: [policy.id, remaining_policy_id],
        created_at: now,
        updated_at: now
      });

      await api.policies.deletePolicy(system, {
        actor: cardinal.SYSTEM_ACTOR,
        id: policy.id
      });

      const updated_user = await system.mongo.users.findOne({
        _id: user.insertedId
      });
      const updated_role = await system.mongo.roles.findOne({
        _id: role.insertedId
      });
      const updated_token = await system.mongo.tokens.findOne({
        _id: token.insertedId
      });

      expect(updated_user?.policy_ids?.length).toBe(1);
      expect(updated_user?.policy_ids?.[0]).toBe(remaining_policy_id);

      expect(updated_role?.policy_ids?.length).toBe(1);
      expect(updated_role?.policy_ids?.[0]).toBe(remaining_policy_id);

      expect(updated_token?.policy_ids?.length).toBe(1);
      expect(updated_token?.policy_ids?.[0]).toBe(remaining_policy_id);

      expect(utils.getEvents(system)).toMatchSnapshot();
    });
  });

  describe('policy-auth', () => {
    const unscoped_policy: cardinal.Policy = {
      name: 'scoped-policy',
      statements: []
    };

    const scoped_policy: cardinal.Policy = {
      name: 'scoped-policy',
      org_id: '123',
      statements: []
    };

    const unscoped_create_permission: cardinal.Policy = {
      statements: [
        {
          actions: ['create'],
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
    };

    const scoped_create_permission: cardinal.Policy = _.merge({}, unscoped_create_permission, {
      statements: [
        {
          resources: [
            {
              scope: '123'
            }
          ]
        }
      ]
    });

    const unscoped_read_permission: cardinal.Policy = {
      statements: [
        {
          actions: ['read'],
          resources: [
            {
              selector: {
                model: 'app',
                id: '*'
              }
            }
          ]
        }
      ]
    };

    const scoped_read_permission: cardinal.Policy = _.merge({}, unscoped_read_permission, {
      statements: [
        {
          resources: [
            {
              scope: '*'
            }
          ]
        }
      ]
    });

    const unscoped_statement: cardinal.PolicyStatement = {
      actions: ['read'],
      resources: [
        {
          selector: {
            model: 'app',
            id: '*'
          }
        }
      ]
    };

    const scoped_statement: cardinal.PolicyStatement = {
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
    };

    test('should be unauthorized to create policy [operation]', async () => {
      const context = mocks.createMockedContext(system, []);

      const res = await auth.policies.authorizedToCreatePolicy({ params: scoped_policy, context });
      expect(res.authorized).toBeFalsy();
    });

    test('should be unauthorized to create policy [scope]', async () => {
      const scoped_context = mocks.createMockedContext(system, [scoped_create_permission]);
      const unscoped_context = mocks.createMockedContext(system, [unscoped_create_permission]);

      const res1 = await auth.policies.authorizedToCreatePolicy({ params: unscoped_policy, context: scoped_context });
      expect(res1.authorized).toBeFalsy();

      const res2 = await auth.policies.authorizedToCreatePolicy({ params: scoped_policy, context: unscoped_context });
      expect(res2.authorized).toBeFalsy();
    });

    test('should be unauthorized to create policy [policy/statement scope mismatch]', async () => {
      const scoped_context = mocks.createMockedContext(system, [
        scoped_create_permission,
        {
          statements: [
            {
              actions: ['read'],
              resources: [
                {
                  scope: '12345',
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

      // This should be unauthorized because the statement scopes do not match the resource org_id
      const res = await auth.policies.authorizedToCreatePolicy({
        params: {
          ...scoped_policy,
          statements: [
            {
              actions: ['read'],
              resources: [
                {
                  scope: '12345',
                  selector: {
                    model: 'app',
                    id: '*'
                  }
                }
              ]
            }
          ]
        },
        context: scoped_context
      });
      expect(res.authorized).toBeFalsy();
    });

    test('should be authorized to create policy [operation]', async () => {
      const scoped_context = mocks.createMockedContext(system, [scoped_create_permission]);
      const unscoped_context = mocks.createMockedContext(system, [unscoped_create_permission]);

      const res1 = await auth.policies.authorizedToCreatePolicy({ params: scoped_policy, context: scoped_context });
      expect(res1.authorized).toBeTruthy();

      const res2 = await auth.policies.authorizedToCreatePolicy({ params: unscoped_policy, context: unscoped_context });
      expect(res2.authorized).toBeTruthy();
    });

    test('should be unauthorized to create policies [statements 1]', async () => {
      const policy: cardinal.Policy = {
        ...scoped_policy,
        statements: [scoped_statement]
      };

      const scoped_context = mocks.createMockedContext(system, [scoped_create_permission]);

      const res = await auth.policies.authorizedToCreatePolicy({ params: policy, context: scoped_context });
      expect(res.authorized).toBeFalsy();
    });

    test('should be unauthorized to create policies [statements 2]', async () => {
      const new_scoped_policy: cardinal.Policy = {
        ...scoped_policy,
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

      const scoped_context = mocks.createMockedContext(system, [
        scoped_create_permission,
        {
          statements: [
            {
              actions: ['read'],
              resources: [
                {
                  scope: '123',
                  selector: {
                    model: 'app',
                    id: '123'
                  }
                }
              ]
            }
          ]
        }
      ]);

      const res1 = await auth.policies.authorizedToCreatePolicy({ params: new_scoped_policy, context: scoped_context });
      expect(res1.authorized).toBeFalsy();
    });

    test('should be authorized to create policies [statements]', async () => {
      const new_scoped_policy: cardinal.Policy = {
        ...scoped_policy,
        statements: [scoped_statement]
      };

      const new_unscoped_policy: cardinal.Policy = {
        ...unscoped_policy,
        statements: [unscoped_statement]
      };

      const scoped_context = mocks.createMockedContext(system, [scoped_create_permission, scoped_read_permission]);
      const unscoped_context = mocks.createMockedContext(system, [
        unscoped_create_permission,
        unscoped_read_permission
      ]);

      const res1 = await auth.policies.authorizedToCreatePolicy({ params: new_scoped_policy, context: scoped_context });
      expect(res1.authorized).toBeTruthy();

      const res2 = await auth.policies.authorizedToCreatePolicy({
        params: new_unscoped_policy,
        context: unscoped_context
      });
      expect(res2.authorized).toBeTruthy();
    });

    test('should be unauthorized to create policies with $or values [statements]', async () => {
      const current_policy: cardinal.Policy = {
        statements: [
          {
            actions: ['read'],
            resources: [
              {
                scope: '123',
                selector: {
                  model: 'app',
                  id: '123'
                }
              }
            ]
          }
        ]
      };

      // Here we have an intersection of 'read' with current assigned policies. This should still not
      // allow creation due to the additional 'create' action also present
      const action_intersection_policy: cardinal.Policy = {
        ...scoped_policy,
        statements: [
          {
            actions: ['read', 'create'],
            resources: [
              {
                scope: '123',
                selector: {
                  model: ['app'],
                  id: '123'
                }
              }
            ]
          }
        ]
      };

      // Here we have an intersection of 'app' with current assigned policies. This should still not
      // allow creation due to the additional 'user' model also present
      const model_intersection_policy: cardinal.Policy = {
        ...scoped_policy,
        statements: [
          {
            actions: ['read'],
            resources: [
              {
                scope: '123',
                selector: {
                  model: ['app', 'user'],
                  id: '123'
                }
              }
            ]
          }
        ]
      };

      const context = mocks.createMockedContext(system, [scoped_create_permission, current_policy]);

      const res1 = await auth.policies.authorizedToCreatePolicy({
        params: action_intersection_policy,
        context: context
      });
      expect(res1.authorized).toBeFalsy();
      const res2 = await auth.policies.authorizedToCreatePolicy({
        params: model_intersection_policy,
        context: context
      });
      expect(res2.authorized).toBeFalsy();
    });

    test('should be unauthorized to modify policy [managed]', async () => {
      const policy = await api.policies.createPolicy(system, {
        actor: cardinal.SYSTEM_ACTOR,
        policy: {
          ...scoped_policy,
          managed: true,
          statements: []
        }
      });

      const scoped_context = mocks.createMockedContext(system, [
        {
          statements: [
            {
              actions: ['write'],
              resources: [
                {
                  scope: '123',
                  selector: {
                    model: CardinalModel.POLICY,
                    id: '*'
                  }
                }
              ]
            },
            {
              actions: [PolicyModelAction.DELETE],
              resources: [
                {
                  scope: '123',
                  selector: {
                    model: CardinalModel.POLICY,
                    id: '*'
                  }
                }
              ]
            }
          ]
        }
      ]);

      await expect(auth.policies.authorizedToUpdatePolicy({ params: policy, context: scoped_context })).rejects.toThrow(
        errors.ManagedResourceError
      );

      await expect(auth.policies.authorizedToDeletePolicy({ params: policy, context: scoped_context })).rejects.toThrow(
        errors.ManagedResourceError
      );
    });

    test('should only return policies authorized to read', async () => {
      const org_id_1 = '5f8ec0f7dbfb68e57f3bfa23';
      const org_id_2 = '5f8ec103dbfb68e57f3bfa25';

      const p1 = await api.policies.createPolicy(system, {
        actor: cardinal.SYSTEM_ACTOR,
        policy: {
          name: 'Scoped Policy 1',
          statements: [],
          org_id: org_id_1
        }
      });
      await api.policies.createPolicy(system, {
        actor: cardinal.SYSTEM_ACTOR,
        policy: {
          name: 'Scoped Policy 2',
          statements: [],
          org_id: org_id_1
        }
      });
      await api.policies.createPolicy(system, {
        actor: cardinal.SYSTEM_ACTOR,
        policy: {
          name: 'Scoped Policy 3',
          statements: [],
          org_id: org_id_2
        }
      });

      await api.policies.createPolicy(system, {
        actor: cardinal.SYSTEM_ACTOR,
        policy: {
          name: 'Unscoped Policy',
          statements: []
        }
      });

      await system.resolver.init();

      const permissions_1: cardinal.Policy[] = [
        {
          statements: [
            {
              actions: ['read'],
              resources: [
                {
                  scope: org_id_1,
                  selector: {
                    model: CardinalModel.POLICY,
                    id: p1.id
                  }
                }
              ]
            }
          ]
        }
      ];

      const permissions_2: cardinal.Policy[] = [
        {
          statements: [
            {
              actions: ['read'],
              resources: [
                {
                  scope: org_id_1,
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

      const scoped_1 = await api.policies.listPolicies(system, {
        org_id: org_id_1,
        policies: permissions_1
      });
      const scoped_2 = await api.policies.listPolicies(system, {
        org_id: org_id_1,
        policies: permissions_2
      });
      const scoped_3 = await api.policies.listPolicies(system, {
        org_id: org_id_2,
        policies: permissions_1
      });
      const scoped_4 = await api.policies.listPolicies(system, {
        org_id: org_id_1,
        policies: []
      });
      const unscoped = await api.policies.listPolicies(system, {
        org_id: {
          exists: false
        },
        policies: permissions_1
      });

      expect(scoped_1.items.length).toEqual(1);
      expect(scoped_1.items[0].id).toEqual(p1.id);

      expect(scoped_2.items.length).toEqual(2);
      expect(utils.removeVolatile(scoped_2.items)).toMatchSnapshot();

      expect(scoped_3.items).toEqual([]);
      expect(scoped_4.items).toEqual([]);
      expect(unscoped.items).toEqual([]);
    });
  });
});
