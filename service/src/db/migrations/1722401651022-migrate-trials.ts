import * as scripts from '../../scripts';
import * as db from '../db';
import { MANAGED_POLICY } from '../../auth';

export const up = async () => {
  const client = db.createClient();
  await client.connect();

  await client.policies.updateMany(
    {
      managed: true,
      name: 'trial-owner'
    },
    {
      $set: {
        name: MANAGED_POLICY.OWNER
      }
    }
  );

  await client.policies.updateMany(
    {
      managed: true,
      name: 'trial-developer'
    },
    {
      $set: {
        name: MANAGED_POLICY.DEVELOPER
      }
    }
  );

  await scripts.updateManagedPolicies(client);
  await client.close();
};

export const down = async () => {};
