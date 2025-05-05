import * as scripts from '../../scripts';
import * as db from '../db';

export const up = async () => {
  const client = db.createClient();
  await client.connect();
  await scripts.updateManagedPolicies(client);
  await client.close();
};

export const down = async () => {};
