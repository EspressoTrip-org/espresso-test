import * as db from '../db';
import * as _ from 'lodash';
import { AnyBulkWriteOperation } from 'mongodb';
import { UserResource, MANAGED_ROLE } from '@journeyapps-platform/types-cardinal';

export const up = async () => {
  const client = db.createClient();
  await client.connect();

  try {
    const trial_orgs = await client.organizations.find({ trial: true }).toArray();
    const managed_owner_roles = await client.roles
      .find({
        managed: true,
        name: MANAGED_ROLE.OWNER,
        org_id: { $in: trial_orgs.map((org) => org._id.toString()) }
      })
      .toArray();

    const users = await client.users.find().toArray();

    const userUpdates = _.chain(users)
      .map((user) => {
        const owner_role = managed_owner_roles.find((r) => r.org_id === user.org_id);
        const owner_role_id = owner_role?._id?.toHexString();

        if (!owner_role_id) {
          return null;
        } else if (user.role_ids?.includes(owner_role_id)) {
          return null;
        }

        return {
          user,
          role_to_add: owner_role_id
        };
      })
      .compact()
      .value();

    const bulkUserUpdate: AnyBulkWriteOperation<UserResource>[] = userUpdates.map((update) => {
      return {
        updateOne: {
          filter: { _id: update.user._id },
          update: {
            $push: {
              role_ids: update.role_to_add
            }
          }
        }
      };
    });

    console.log(`Updating ${bulkUserUpdate.length} users...`);

    if (!bulkUserUpdate.length) {
      console.log(`No updates to process.`);
      return;
    }

    // Persist users
    await client.users.bulkWrite(bulkUserUpdate);
  } finally {
    await client.close();
  }
};
export const down = async () => {};
