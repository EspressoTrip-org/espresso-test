/**
 * A user's policies are filtered when fetched. If an Org has been locked,
 * the Org's roles and policies are filtered out. This means that the user
 * cannot unassign that role from themselves since they don't have those permissions available.
 * https://github.com/journeyapps-platform/cardinal/blob/81b7e2ccbac13b0b522a82cb219472f39606d488/service/src/api/policies.ts#L348
 *
 * This migration will remove all role/policy assignments from users for locked Orgs
 * (if the user does not have the locked Org as their parent org).
 */

import * as _ from 'lodash';
import { AnyBulkWriteOperation } from 'mongodb';
import * as micro from '@journeyapps-platform/micro';

import { UserResource } from '@journeyapps-platform/types-cardinal';
import * as db from '../db';

export const up = async () => {
  const client = db.createClient();
  await client.connect();

  const lockedOrgs = await client.organizations.find({ locked: true, trial: true }).toArray();
  const lockedRoles = await client.roles
    .find({ org_id: { $in: lockedOrgs.map((org) => org._id.toString()) } })
    .toArray();
  const lockedPolicies = await client.policies
    .find({ org_id: { $in: lockedOrgs.map((org) => org._id.toString()) } })
    .toArray();

  // Need to use All users here, in order to determine if they have a locked org's role/policy
  // assigned to them.
  const users = await client.users.find().toArray();

  // Create a MongoDB BulkWriteOperation to remove all locked roles and policies from users
  const userUpdates = _.chain(users)
    .map((user) => {
      const nonParentOrgRoles = lockedRoles.filter((role) => role.org_id !== user.org_id);
      const nonParentOrgPolicies = lockedPolicies.filter((policy) => policy.org_id !== user.org_id);

      const rolesToRemove = _.intersection(
        user.role_ids,
        nonParentOrgRoles.map((role) => role._id.toString())
      );
      const policiesToRemove = _.intersection(
        user.policy_ids,
        nonParentOrgPolicies.map((policy) => policy._id.toString())
      );

      // Don't do anything to this user if there are no changes
      if (!rolesToRemove.length && !policiesToRemove.length) {
        return null;
      }

      return {
        user,
        rolesToRemove,
        policiesToRemove
      };
    })
    .compact()
    .value();

  const bulkUserUpdate: AnyBulkWriteOperation<UserResource>[] = userUpdates.map((update) => {
    return {
      updateOne: {
        filter: { _id: update.user._id },
        update: {
          $pull: {
            role_ids: { $in: update.rolesToRemove },
            policy_ids: { $in: update.policiesToRemove }
          }
        }
      }
    };
  });

  console.log(`Updating ${bulkUserUpdate.length} users...`);

  if (!bulkUserUpdate.length) {
    console.log(`There were no updates to do`);
    return;
  }

  // Persist users
  await client.users.bulkWrite(bulkUserUpdate);

  await client.close();
};

export const down = async () => {};
