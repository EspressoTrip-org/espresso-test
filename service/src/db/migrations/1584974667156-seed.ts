import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as bson from 'bson';
import * as db from '../db';

const super_user_policy: cardinal.Managed & cardinal.Policy = {
  name: 'platform-super-user',
  description: 'The holder of this policy can do anything on the platform',
  managed: true,
  statements: [
    {
      actions: ['*'],
      resources: [
        {
          scope: '*',
          selector: {
            model: '*',
            id: '*'
          }
        },
        {
          selector: {
            model: '*',
            id: '*'
          }
        }
      ]
    }
  ]
};

export const up = async () => {
  const client = await db.createClient();
  await client.connect();

  await Promise.all([
    client.tokens.createIndex(
      { value: 1 },
      {
        name: 'token-value',
        unique: true
      }
    ),
    client.tokens.createIndex(
      { policy_ids: 1, org_id: 1 },
      {
        name: 'token-associations'
      }
    ),
    client.users.createIndex(
      { org_id: 1 },
      {
        name: 'user-org-associations'
      }
    ),
    client.users.createIndex(
      { policy_ids: 1 },
      {
        name: 'user-policy-associations'
      }
    ),
    client.users.createIndex(
      { role_ids: 1 },
      {
        name: 'user-role-associations'
      }
    ),
    client.roles.createIndex(
      { policy_ids: 1, org_id: 1 },
      {
        name: 'role-associations'
      }
    ),
    client.policies.createIndex(
      { org_id: 1 },
      {
        name: 'policy-associations'
      }
    )
  ]);

  // @ts-ignore
  const existing = await client.policies.findOne({
    name: super_user_policy.name,
    managed: true
  });
  if (existing) {
    return;
  }

  const now = new Date();
  await client.policies.insertOne({
    _id: new bson.ObjectId(),

    ...super_user_policy,
    created_at: now,
    updated_at: now
  });

  await client.close();
};

export const down = async () => {
  const client = await db.createClient();
  await client.connect();

  await client.policies.deleteOne({
    name: super_user_policy.name,
    managed: true
  });

  await Promise.all([
    client.tokens.dropIndexes(),
    client.users.dropIndexes(),
    client.roles.dropIndexes(),
    client.policies.dropIndexes()
  ]);

  await client.close();
};
