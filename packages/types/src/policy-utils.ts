import * as defs from './schema/definitions';

/**
 * Generates the cartesian product from a given policy statement.
 *
 * It is important that we break this up into permissions that are as singular as possible to improve the
 * effectiveness of our resolver. The cartesian product of a Policy is not the same as a Permission
 * with `$or` property values - especially when brought up in comparisons between two Policies.
 * This is because we perform 1:1 comparisons between permissions and as a result cannot
 * resolve accumulative access (access granted as a result of more than 1 permission).
 *
 * Put simply:
 *
 * :: [[a, b], [c, d]] !== [[a, d]]
 *
 * even though doing accumulative comparisons would resolve successfully (inferring a and d from two different permissions).
 *
 * This is kind of a plaster and having a smarter resolver would remove the need to do this - but it is good
 * enough for now
 */
export const createPermissionsFromStatement = (statement: defs.PolicyStatement) => {
  return statement.actions.reduce((permissions: defs.Permission[], action) => {
    return statement.resources.reduce((permissions, resource) => {
      const permission: defs.Permission = {
        action: action,
        resource: resource
      };
      if (statement.effect) {
        permission.effect = statement.effect;
      }

      permissions.push(permission);
      return permissions;
    }, permissions);
  }, []);
};

export const createPermissionsFromPolicy = (policy: defs.Policy) => {
  return policy.statements.reduce((permissions: defs.Permission[], statement) => {
    permissions.push(...createPermissionsFromStatement(statement));
    return permissions;
  }, []);
};

export const createPermissionsFromPolicies = (policies: defs.Policy[]) => {
  return policies.reduce((permissions: defs.Permission[], policy) => {
    permissions.push(...createPermissionsFromPolicy(policy));
    return permissions;
  }, []);
};
