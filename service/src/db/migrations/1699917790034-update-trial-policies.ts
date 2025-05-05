import * as db from '../db';
import * as auth from '../../auth/generated-policies/org-defaults';

export const up = async () => {
  // Methods in this file are now defunct
  if (true) {
    return;
  }

  const client = db.createClient();
  await client.connect();

  try {
    const trial_orgs = await client.organizations.find({ trial: true }).toArray();
    // Specifically don't use reprovisionStandardPoliciesForOrg because we want to _not_ emit events.

    const managed_policies = await client.policies
      .find({
        managed: true,
        org_id: {
          $in: trial_orgs.map((org) => org._id.toHexString())
        },
        name: {
          $in: [auth.MANAGED_POLICY.OWNER, auth.MANAGED_POLICY.DEVELOPER]
        }
      })
      .toArray();

    /*
      Rewrite the OWNER and DEVELOPER policies for trial orgs with the corresponding new trial policy.
      This will also rename the affected policies.
     */
    await client.policies.bulkWrite(
      managed_policies.map((policy) => {
        let new_policy;
        switch (policy.name) {
          case auth.MANAGED_POLICY.OWNER: {
            // JUL 30 2024 - Defunct method
            // new_policy = auth.createTrialOwnerPolicy(policy.org_id!);
            break;
          }
          case auth.MANAGED_POLICY.DEVELOPER: {
            // JUL 30 2024 - Defunct method
            // new_policy = auth.createTrialDeveloperPolicy(policy.org_id!);
            break;
          }
          default: {
            throw new Error('unknown policy name');
          }
        }

        return {
          updateOne: {
            filter: {
              _id: policy._id
            },
            update: {
              $set: {
                // ...new_policy
              }
            }
          }
        };
      })
    );
  } finally {
    await client.close();
  }
};
export const down = async () => {};
