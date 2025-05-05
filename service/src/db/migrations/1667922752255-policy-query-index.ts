import * as db from '../db';

export const up = async () => {
  const client = await db.createClient();
  await client.connect();

  await Promise.all([
    client.policies.createIndex(
      { _id: 1, org_id: 1 },
      {
        name: 'policy-orgs-query'
      }
    ),
    client.organizations.createIndex(
      { _id: 1, locked: 1 },
      {
        name: 'locked-orgs-query'
      }
    )
  ]);

  await client.close();
};

export const down = async () => {
  const client = await db.createClient();
  await client.connect();

  await Promise.all([
    client.policies.dropIndex('policy-orgs-query'),
    client.organizations.dropIndex('locked-orgs-query')
  ]);

  await client.close();
};
