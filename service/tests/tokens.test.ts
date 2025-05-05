import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

import * as cardinal from '@journeyapps-platform/types-cardinal';
import { System } from '../src/system';
import * as auth from '../src/auth';
import * as api from '../src/api';
import * as mocks from './mocks';
import * as utils from './utils';
import * as _ from 'lodash';
import { AppModelAction, CardinalModel, TokenModelAction } from '@journeyapps-platform/cardinal-catalog';
import { ObjectId } from 'bson';
import { TokenPrefix } from '../src/api/tokens';

let system: System;

beforeAll(async () => {
  system = await mocks.createMockedSystem();
  await system.start();
});

afterEach(async () => {
  (system.producer as any).clear();
  await system.mongo.tokens.deleteMany({});
});

afterAll(async () => {
  await system.stop();
});

describe('tokens', () => {
  const common_scoped_token: cardinal.TokenWithoutValue = {
    description: 'scoped',
    policy_ids: [],
    org_id: '123'
  };

  const common_pat: cardinal.TokenWithoutValue & cardinal.Personal = {
    description: 'scoped',
    policy_ids: [],
    org_id: '123',
    user_id: '65f9e78e6e5aa157648b12fc'
  };

  const common_unscoped_token: cardinal.TokenWithoutValue = {
    description: 'unscoped',
    policy_ids: []
  };

  const common_statement_unscoped: cardinal.PolicyStatement = {
    actions: [AppModelAction.READ],
    resources: [
      {
        selector: {
          model: CardinalModel.APP,
          id: '*'
        }
      }
    ]
  };

  const common_statement_scoped: cardinal.PolicyStatement = {
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
  };

  const common_policy_unscoped: cardinal.Policy = {
    statements: [common_statement_unscoped]
  };

  const common_policy_scoped: cardinal.Policy = {
    org_id: '123',
    statements: [common_statement_scoped]
  };

  const setupTokenCrudPerms = (action: TokenModelAction) => {
    const permission_unscoped: cardinal.Policy = {
      statements: [
        {
          actions: [action],
          resources: [
            {
              selector: {
                model: CardinalModel.TOKEN,
                id: '*'
              }
            }
          ]
        }
      ]
    };

    const permission_scoped: cardinal.Policy = _.merge({}, permission_unscoped, {
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

    const permission_scoped_pat: cardinal.Policy = _.merge({}, permission_scoped, {
      statements: [
        {
          resources: [
            {
              selector: {
                id: null,
                labels: {
                  user_id: '65f9e78e6e5aa157648b12fc'
                }
              }
            }
          ]
        }
      ]
    });

    delete (permission_scoped_pat.statements[0].resources[0].selector as Partial<cardinal.IDResourceSelector>)['id'];
    return {
      permission_unscoped,
      permission_scoped,
      permission_scoped_pat
    };
  };

  // !------------- create tokens -----------------

  const create_perms = setupTokenCrudPerms(TokenModelAction.CREATE);
  const create_permission_unscoped = create_perms.permission_unscoped;
  const create_permission_scoped = create_perms.permission_scoped;
  const create_permission_scoped_pat = create_perms.permission_scoped_pat;

  // !------------- revoke tokens -----------------

  const revoke_perms = setupTokenCrudPerms(TokenModelAction.REVOKE);
  const revoke_permission_unscoped = revoke_perms.permission_unscoped;
  const revoke_permission_scoped = revoke_perms.permission_scoped;
  const revoke_permission_scoped_pat = revoke_perms.permission_scoped_pat;

  // !------------- read tokens -----------------

  const read_permission_unscoped: cardinal.Policy = {
    statements: [
      {
        actions: [AppModelAction.READ],
        resources: [
          {
            selector: {
              model: CardinalModel.APP,
              id: '*'
            }
          }
        ]
      }
    ]
  };

  const read_permission_scoped: cardinal.Policy = _.merge({}, read_permission_unscoped, {
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

  test('should list tokens by scope', async () => {
    await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: common_scoped_token
    });

    await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: common_unscoped_token
    });

    const scoped = await api.tokens.listScopedTokensForOrganization(system.mongo, {
      org_id: '123'
    });
    const unscoped = await api.tokens.listUnscopedTokens(system.mongo);

    expect(utils.removeVolatile(scoped)).toMatchSnapshot();
    expect(utils.removeVolatile(unscoped)).toMatchSnapshot();
  });

  test('should successfully update a token', async () => {
    const token = await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: {
        description: 'test token',
        org_id: '123',
        policy_ids: []
      }
    });

    await api.tokens.updateToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: {
        ...token,
        description: 'Updated Token'
      }
    });

    const updated_token = await api.tokens.getToken(system.mongo, token.id);
    expect(utils.removeVolatile(api.tokens.stripTokenValue(updated_token))).toMatchSnapshot();

    expect(utils.getEvents(system)).toMatchSnapshot();
  });

  test('should be unauthorized to create token [operation]', async () => {
    const context = mocks.createMockedContext(system, []);

    const res = await auth.tokens.authorizedToCreateToken({ params: common_unscoped_token, context });
    expect(res.authorized).toBeFalsy();
  });

  test('should be unauthorized to create token [scope]', async () => {
    const context_for_scoped = mocks.createMockedContext(system, [create_permission_scoped]);
    const context_for_unscoped = mocks.createMockedContext(system, [create_permission_unscoped]);

    const res1 = await auth.tokens.authorizedToCreateToken({
      params: common_unscoped_token,
      context: context_for_scoped
    });
    expect(res1.authorized).toBeFalsy();

    const res2 = await auth.tokens.authorizedToCreateToken({
      params: common_scoped_token,
      context: context_for_unscoped
    });
    expect(res2.authorized).toBeFalsy();
  });

  test('should be authorized to create token [operation]', async () => {
    const context_scoped = mocks.createMockedContext(system, [create_permission_scoped]);
    const context_unscoped = mocks.createMockedContext(system, [create_permission_unscoped]);

    const res1 = await auth.tokens.authorizedToCreateToken({ params: common_scoped_token, context: context_scoped });
    expect(res1.authorized).toBeTruthy();

    const res2 = await auth.tokens.authorizedToCreateToken({
      params: common_unscoped_token,
      context: context_unscoped
    });
    expect(res2.authorized).toBeTruthy();
  });

  test('should be unauthorized to create token [policy scope]', async () => {
    const scoped_policy = await api.policies.createPolicy(system, {
      actor: cardinal.SYSTEM_ACTOR,
      policy: common_policy_scoped
    });
    const unscoped_policy = await api.policies.createPolicy(system, {
      actor: cardinal.SYSTEM_ACTOR,
      policy: common_policy_unscoped
    });
    const scoped_token: cardinal.TokenWithoutValue = {
      ...common_scoped_token,
      policy_ids: [unscoped_policy.id]
    };

    const unscoped_token: cardinal.TokenWithoutValue = {
      ...common_unscoped_token,
      policy_ids: [scoped_policy.id]
    };

    const context_scoped = mocks.createMockedContext(system, [create_permission_scoped, read_permission_scoped]);
    const context_unscoped = mocks.createMockedContext(system, [create_permission_unscoped, read_permission_unscoped]);

    const res1 = await auth.tokens.authorizedToCreateToken({ params: scoped_token, context: context_scoped });
    expect(res1.authorized).toBeFalsy();

    const res2 = await auth.tokens.authorizedToCreateToken({ params: unscoped_token, context: context_unscoped });
    expect(res2.authorized).toBeFalsy();
  });

  test('should be unauthorized to create token [token/policy scope mismatch]', async () => {
    const scoped_policy = await api.policies.createPolicy(system, {
      actor: cardinal.SYSTEM_ACTOR,
      policy: {
        ...common_policy_scoped,
        org_id: '1234'
      }
    });
    const context_for_scoped = mocks.createMockedContext(system, [create_permission_scoped, read_permission_scoped]);

    const res = await auth.tokens.authorizedToCreateToken({
      params: {
        ...common_scoped_token,
        policy_ids: [scoped_policy.id]
      },
      context: context_for_scoped
    });
    expect(res.authorized).toBeFalsy();
  });

  test('should be unauthorized to create token [attached policies]', async () => {
    const scoped_policy = await api.policies.createPolicy(system, {
      actor: cardinal.SYSTEM_ACTOR,
      policy: common_policy_scoped
    });
    const scoped_token: cardinal.TokenWithoutValue = {
      ...common_scoped_token,
      policy_ids: [scoped_policy.id]
    };

    const context_scoped = mocks.createMockedContext(system, [create_permission_scoped]);

    const res = await auth.tokens.authorizedToCreateToken({ params: scoped_token, context: context_scoped });
    expect(res.authorized).toBeFalsy();
  });

  test('should be authorized to revoke tokens', async () => {
    const scoped_token = await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: common_scoped_token
    });

    const pat_token = await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: common_pat
    });

    const pat_token_diff_user = await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: {
        ...common_pat,
        user_id: '65f9e78e6e5aa157648b12k'
      }
    });

    const unscoped_token = await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: common_unscoped_token
    });

    const context_scoped = mocks.createMockedContext(system, [revoke_permission_scoped]);
    const context_unscoped = mocks.createMockedContext(system, [revoke_permission_unscoped]);
    const context_pat = mocks.createMockedContext(system, [revoke_permission_scoped_pat]);

    await system.resolver.init();

    const res1 = await context_scoped.viewer.can(TokenModelAction.REVOKE, CardinalModel.TOKEN, scoped_token.id);
    expect(res1.authorized).toBeTruthy();

    const res2 = await context_unscoped.viewer.can(TokenModelAction.REVOKE, CardinalModel.TOKEN, unscoped_token.id);
    expect(res2.authorized).toBeTruthy();

    const res3 = await context_pat.viewer.can(TokenModelAction.REVOKE, CardinalModel.TOKEN, pat_token.id);
    expect(res3.authorized).toBeTruthy();

    // should not be able to delete other peoples tokens
    const res4 = await context_pat.viewer.can(TokenModelAction.REVOKE, CardinalModel.TOKEN, pat_token_diff_user.id);
    expect(res4.authorized).toBeFalsy();
  });

  test('should be authorized to create pats [policies]', async () => {
    const scoped_policy = await api.policies.createPolicy(system, {
      actor: cardinal.SYSTEM_ACTOR,
      policy: common_policy_scoped
    });

    const scoped_policy_not_allowed = await api.policies.createPolicy(system, {
      actor: cardinal.SYSTEM_ACTOR,
      policy: {
        ...common_policy_scoped,
        statements: [
          {
            actions: [AppModelAction.READ],
            resources: [
              {
                scope: 'wrong_id', //<--------- this should correctly cause a failure further down
                selector: {
                  model: CardinalModel.APP,
                  id: '*'
                }
              }
            ]
          }
        ]
      }
    });

    const unscoped_policy_not_allowed = await api.policies.createPolicy(system, {
      actor: cardinal.SYSTEM_ACTOR,
      policy: common_policy_unscoped
    });

    const scoped_token: cardinal.TokenWithoutValue = {
      ...common_scoped_token,
      policy_ids: [scoped_policy.id]
    };

    await system.mongo.users.insertOne({
      _id: new ObjectId('65f9e78e6e5aa157648b12fc'),
      org_id: '123',
      email: 'test@test.com',
      /*
        In these test below, we don't actually create role and policy resources, but we do provide them
        in the createMockedContext() function below.
      */
      policy_ids: [],
      role_ids: []
    });

    const pat_token: cardinal.CreatePersonalTokenParams = _.omit(
      {
        ...common_pat,
        policy_ids: [scoped_policy.id]
      },
      'org_id'
    );

    const pat_token_not_allowed: cardinal.CreatePersonalTokenParams = _.omit(
      {
        ...common_pat,
        policy_ids: [scoped_policy_not_allowed.id]
      },
      'org_id'
    );

    const pat_token_not_allowed_unscoped: cardinal.CreatePersonalTokenParams = _.omit(
      {
        ...common_pat,
        policy_ids: [unscoped_policy_not_allowed.id]
      },
      'org_id'
    );

    /*
      This call is essentially specifies which permissions the user (created above) has
     */
    const context_pat = mocks.createMockedContext(system, [create_permission_scoped_pat, read_permission_scoped]);
    await system.resolver.init();

    const res3 = await auth.tokens.authorizedToCreatePAT({ params: pat_token, context: context_pat });
    expect(res3.authorized).toBeTruthy();

    // should not be able to create pats for other users
    const res4 = await auth.tokens.authorizedToCreatePAT({
      params: { ...pat_token, user_id: '95f9e78e6e5aa157648b12fe' },
      context: context_pat
    });
    expect(res4.authorized).toBeFalsy();

    // should not be able to create pats for the org without a user_id
    const res5 = await auth.tokens.authorizedToCreatePAT({
      params: scoped_token as any,
      context: context_pat
    });
    expect(res5.authorized).toBeFalsy();

    // check against standard create auth (in the case of a pat, the authorizedToCreatePAT check should be used instead
    // because it will project the user_id as a label)
    const res6 = await auth.tokens.authorizedToCreateToken({
      params: pat_token,
      context: context_pat
    });
    expect(res6.authorized).toBeFalsy();

    const res7 = await auth.tokens.authorizedToCreatePAT({ params: pat_token_not_allowed, context: context_pat });
    expect(res7.authorized).toBeFalsy();

    const res8 = await auth.tokens.authorizedToCreatePAT({
      params: pat_token_not_allowed_unscoped,
      context: context_pat
    });
    expect(res8.authorized).toBeFalsy();
  });

  test('should be authorized to create scoped and unscoped tokens [policies]', async () => {
    const scoped_policy = await api.policies.createPolicy(system, {
      actor: cardinal.SYSTEM_ACTOR,
      policy: common_policy_scoped
    });
    const unscoped_policy = await api.policies.createPolicy(system, {
      actor: cardinal.SYSTEM_ACTOR,
      policy: common_policy_unscoped
    });
    const scoped_token: cardinal.TokenWithoutValue = {
      ...common_scoped_token,
      policy_ids: [scoped_policy.id]
    };

    const unscoped_token: cardinal.TokenWithoutValue = {
      ...common_unscoped_token,
      policy_ids: [unscoped_policy.id]
    };

    const context_scoped = mocks.createMockedContext(system, [create_permission_scoped, read_permission_scoped]);
    const context_unscoped = mocks.createMockedContext(system, [create_permission_unscoped, read_permission_unscoped]);

    await system.resolver.init();

    const res1 = await auth.tokens.authorizedToCreateToken({ params: scoped_token, context: context_scoped });
    expect(res1.authorized).toBeTruthy();

    const res2 = await auth.tokens.authorizedToCreateToken({ params: unscoped_token, context: context_unscoped });
    expect(res2.authorized).toBeTruthy();
  });

  test('should generate tokens with the correct metadata', async () => {
    const org_1 = new ObjectId().toString();

    const token_scoped = await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: {
        ...common_scoped_token,
        org_id: org_1
      }
    });

    const token_user = await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: {
        ...common_scoped_token,
        org_id: org_1,
        user_id: '5e6f5519ede3631176831f4d'
      }
    });

    const token_unscoped = await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: common_unscoped_token
    });

    expect(token_scoped.value.substring(0, 4)).toBe(TokenPrefix.STANDARD);
    expect(token_unscoped.value.substring(0, 4)).toBe(TokenPrefix.STANDARD);
    expect(token_user.value.substring(0, 4)).toBe(TokenPrefix.PAT);

    expect(cardinal.parseToken(token_scoped.value)!.i).toBe(token_scoped.id);
    expect(cardinal.parseToken(token_unscoped.value)!.i).toBe(token_unscoped.id);
    expect(cardinal.parseToken(token_user.value)!.i).toBe(token_user.id);
    expect(cardinal.parseToken(token_user.value)!.u).toBe(token_user.user_id);
  });

  test('should list tokens via routes api with correct permissions', async () => {
    const org_1 = new ObjectId().toString();
    const org_2 = new ObjectId().toString();

    const token_scoped1 = await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: {
        ...common_scoped_token,
        org_id: org_1
      }
    });

    // should not appear in results
    const token_scoped2 = await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: {
        ...common_scoped_token,
        org_id: org_2
      }
    });

    const token_user1 = await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: {
        ...common_scoped_token,
        org_id: org_1,
        user_id: '5e6f5519ede3631176831f4d'
      }
    });

    // should not appear in results (same org as token_user1 but different user)
    const token_user2 = await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: {
        ...common_scoped_token,
        org_id: org_1,
        user_id: '5e6f5519ede3631176831f4e'
      }
    });

    // should not appear in results (different org and user)
    const token_user3 = await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: {
        ...common_scoped_token,
        org_id: org_2,
        user_id: '5e6f5519ede3631176831f4e'
      }
    });

    const token_unscoped = await api.tokens.createToken(system, {
      actor: cardinal.SYSTEM_ACTOR,
      token: common_unscoped_token
    });

    await system.resolver.init();

    // !----------- scoped ----------

    const scoped_policies = [
      {
        statements: [
          {
            actions: [TokenModelAction.READ],
            resources: [
              {
                scope: org_1,
                selector: {
                  model: CardinalModel.TOKEN,
                  id: '*'
                }
              }
            ]
          }
        ]
      } as cardinal.RawPolicy
    ];

    // only list tokens in org 1
    const scoped = await api.tokens.listTokens(system, {
      policies: scoped_policies,
      org_id: org_1,
      user_id: { exists: false }
    });
    expect(scoped.total).toEqual(1);
    expect(scoped.items[0].id).toEqual(token_scoped1.id);

    // should not be able to list for org_2
    const scoped2 = await api.tokens.listTokens(system, {
      policies: scoped_policies,
      org_id: org_2,
      user_id: { exists: false }
    });
    expect(scoped2.total).toEqual(0);

    // !----------- unscoped ----------

    const unscoped = await api.tokens.listTokens(system, {
      policies: [
        {
          statements: [
            {
              actions: [TokenModelAction.READ],
              resources: [
                {
                  selector: {
                    model: CardinalModel.TOKEN,
                    id: '*'
                  }
                }
              ]
            }
          ]
        }
      ]
    });
    expect(unscoped.total).toEqual(1);
    expect(unscoped.items[0].id).toEqual(token_unscoped.id);

    // !----------- pats ----------

    const patpolicies = [
      {
        statements: [
          {
            actions: [TokenModelAction.READ],
            resources: [
              {
                scope: org_1,
                selector: {
                  model: CardinalModel.TOKEN,
                  labels: {
                    user_id: token_user1.user_id
                  }
                }
              }
            ]
          }
        ]
      } as cardinal.RawPolicy
    ];

    const pats1 = await api.tokens.listTokens(system, {
      policies: patpolicies,
      org_id: org_1,
      user_id: '5e6f5519ede3631176831f4d'
    });
    expect(pats1.total).toEqual(1);
    expect(pats1.items[0].id).toEqual(token_user1.id);

    // should not be able to list for the second user (even in the same org)
    const pats2 = await api.tokens.listTokens(system, {
      policies: patpolicies,
      org_id: org_1,
      user_id: '5e6f5519ede3631176831f4e'
    });
    expect(pats2.total).toEqual(0);
  });
});
