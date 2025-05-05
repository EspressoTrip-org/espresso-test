import * as _ from 'lodash';
import * as db from '../db';
import { ObjectId } from 'bson';
import {
  createAppContainerManagementAccessStatements,
  createDeveloperPolicy,
  createOwnerPolicy,
  MANAGED_POLICY
} from '../../auth/generated-policies/org-defaults/index';

const EMAILS = [
  'steven@journeyapps.com',
  'manrich@journeyapps.com',
  'wessels@journeyapps.com',
  'benita@journeyapps.com',
  'ralf@journeyapps.com',
  'dylan@journeyapps.com',
  'john@journeyapps.com'
];

export const up = async () => {
  const client = db.createClient();
  await client.connect();

  const users = await client.users.find({ email: { $in: EMAILS } }).toArray();
  const role_ids = _.chain(users)
    .flatMap((user) => user.role_ids)
    .compact()
    .uniq()
    .map((id) => new ObjectId(id))
    .value();

  const roles = await client.roles.find({ managed: true, _id: { $in: role_ids } }).toArray();

  const policy_ids = _.chain(roles)
    .flatMap((role) => role.policy_ids)
    .compact()
    .uniq()
    .map((id) => new ObjectId(id))
    .value();

  const policies = await client.policies
    .find({
      managed: true,
      _id: { $in: policy_ids },
      name: {
        $in: [MANAGED_POLICY.OWNER, MANAGED_POLICY.DEVELOPER]
      }
    })
    .toArray();

  await client.policies.bulkWrite(
    policies.map((policy) => {
      const org_id = policy.org_id!;
      let new_policy;
      switch (policy.name) {
        case MANAGED_POLICY.OWNER: {
          new_policy = createOwnerPolicy(org_id);
          break;
        }
        case MANAGED_POLICY.DEVELOPER: {
          new_policy = createDeveloperPolicy(org_id);
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
              statements: _.uniqWith(
                new_policy.statements.concat(createAppContainerManagementAccessStatements(org_id)),
                _.isEqual
              )
            }
          }
        }
      };
    })
  );

  await client.close();
};

export const down = async () => {};
