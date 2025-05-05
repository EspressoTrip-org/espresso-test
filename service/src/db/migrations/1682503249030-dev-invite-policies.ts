/**
 * This adds developer default permissions to manage invites and users
 */

import * as scripts from '../../scripts';
import * as db from '../db';

export const up = async () => {
  const client = await db.createClient();
  await client.connect();

  // For dynamic policies
  await scripts.updateManagedPolicies(client);

  await client.close();
};

export const down = async () => {};
