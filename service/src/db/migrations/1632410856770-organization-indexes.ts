import * as db from '../db';

export const up = async () => {
  const client = db.createClient();
  await client.connect();

  await client.organizations.createIndexes([
    {
      name: 'locked-filter',
      key: {
        locked: 1
      }
    }
  ]);

  await client.close();
};
export const down = async () => {
  const client = db.createClient();
  await client.connect();

  await client.organizations.dropIndex('locked-filter');

  await client.close();
};
