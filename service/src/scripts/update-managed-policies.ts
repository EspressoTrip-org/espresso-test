import * as auth from '../auth/generated-policies/org-defaults';
import { logger } from '@journeyapps-platform/micro';
import { MongoDB } from '../system/mongo';

export const updateManagedPolicies = async (mongo: MongoDB) => {
  logger.info('Patching managed policies');
  const managed_policies_cursor = mongo.policies.find({
    managed: true,
    name: {
      $in: [auth.MANAGED_POLICY.OWNER, auth.MANAGED_POLICY.DEVELOPER]
    }
  });

  let count = 0;

  for await (let policy of managed_policies_cursor) {
    let new_policy;
    switch (policy.name) {
      case auth.MANAGED_POLICY.OWNER: {
        new_policy = auth.createOwnerPolicy(policy.org_id!);
        break;
      }
      case auth.MANAGED_POLICY.DEVELOPER: {
        new_policy = auth.createDeveloperPolicy(policy.org_id!);
        break;
      }
      default: {
        throw new Error('unknown policy name');
      }
    }

    await mongo.policies.updateOne(
      {
        _id: policy._id
      },
      {
        $set: {
          statements: new_policy.statements
        }
      }
    );
    count++;

    if (count % 1000 === 0) {
      logger.info(`Patched: [${count}] managed policies so far`);
    }
  }

  logger.info(`Completed managed policy patching, final total: [${count}]`);
};
