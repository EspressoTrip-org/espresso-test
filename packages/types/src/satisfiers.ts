import * as defs from './schema/definitions';
import * as utils from './utils';

export const compareWithWildcards = (permission_field: defs.StringOr, comparison: defs.StringOr) => {
  const permission_fields = utils.castToArray(permission_field);
  const comparison_fields = utils.castToArray(comparison);
  if (permission_fields.includes('*')) {
    return true;
  }
  return utils.strictlyContains(permission_fields, comparison_fields);
};

export const compareLabels = (permission_labels: defs.SelectorLabels, comparison_labels: defs.SelectorLabels) => {
  const keys = Object.keys(permission_labels);
  if (keys.length === 0) {
    return false;
  }

  return keys.reduce((acc, key) => {
    if (!acc) {
      return acc;
    }
    if (comparison_labels[key] == null) {
      return false;
    }
    const permission_label = utils.castToArray(permission_labels[key]);
    const comparison_label = utils.castToArray(comparison_labels[key]);
    return utils.strictlyContains(permission_label, comparison_label);
  }, true);
};

export const satisfiesSelector = (
  permission_selector: defs.ResourceSelector,
  comparison_selector: defs.ResourceSelector
): boolean => {
  if (!compareWithWildcards(permission_selector.model, comparison_selector.model)) {
    return false;
  }

  if (utils.isIDResourceSelector(permission_selector)) {
    if (!utils.isIDResourceSelector(comparison_selector)) {
      // Even if the comparison selector is _not_ an ID selector, we still consider it a successful compare if the
      // permission ID selector is a wildcard. In other words:
      //
      // satisfies?({selector: {id: "*"}}, {selector: {labels: {a: "v"}}} === true
      if (!utils.castToArray(permission_selector.id).includes('*')) {
        return false;
      }
    } else {
      if (!compareWithWildcards(permission_selector.id, comparison_selector.id)) {
        return false;
      }
    }
  } else {
    if (!utils.isLabelResourceSelector(comparison_selector)) {
      return false;
    }
    if (!compareLabels(permission_selector.labels, comparison_selector.labels)) {
      return false;
    }
  }

  const length = permission_selector.parents?.length || 0;
  if (length === 0) {
    return true;
  }

  return !!permission_selector.parents?.reduce((matches: boolean, parent) => {
    if (!matches) {
      return false;
    }

    return !!comparison_selector.parents?.reduce((matches: boolean, comparison_parent) => {
      if (matches) {
        return matches;
      }
      return satisfiesSelector(parent, comparison_parent);
    }, false);
  }, true);
};

export type Satisfier = (permission: defs.Permission) => boolean;

export const permissionsSatisfy = (permissions: defs.Permission[], filters: Satisfier[], init: boolean) => {
  return utils.reduce(
    permissions,
    (satisfied, permission, reduced) => {
      if (satisfied !== init) {
        return reduced(satisfied);
      }

      return utils.reduce(
        filters,
        (satisfied, filter, reduced) => {
          if (satisfied !== init) {
            return reduced(satisfied);
          }
          return filter(permission);
        },
        init
      );
    },
    init
  );
};

/**
 * Given a set of permissions and a set of filters, return true if all filters satisfy all permissions
 */
export const allPermissionsSatisfyAllFilters = (permissions: defs.Permission[], ...filters: Satisfier[]) => {
  return permissionsSatisfy(permissions, filters, true);
};

/**
 * Given a set of permissions and a set of filters, return true if at least one filter satisfies at least
 * one permission
 */
export const onePermissionSatisfiesOneFilter = (permissions: defs.Permission[], ...filters: Satisfier[]) => {
  return permissionsSatisfy(permissions, filters, false);
};

/**
 * Given a set of filters, an action with an audience and a comparison resource return true if one of the permissions
 * in the given set match the namespaced action and resource
 */
export const satisfies = (permissions: defs.Permission[], action: defs.StringOr, comparison: defs.Resource) => {
  const filter = (permission: defs.Permission) => {
    // The actions must match
    if (!compareWithWildcards(permission.action, action)) {
      return false;
    }

    /**
     * If the comparison specifies a scope then the permission must have a scope specified and it must match
     * the comparison.
     *
     * If the comparison does not specify a scope then the permission, too, must not specify a scope
     */
    if (comparison.scope == null) {
      if (permission.resource.scope != null) {
        return false;
      }
    } else {
      if (permission.resource.scope == null) {
        return false;
      }
      if (!compareWithWildcards(permission.resource.scope, comparison.scope)) {
        return false;
      }
    }

    // The resource selector of the comparison must match the resource selector of the permission
    return satisfiesSelector(permission.resource.selector, comparison.selector);
  };

  const { allow, deny } = utils.splitByEffect(permissions);

  const positive_satisfies = onePermissionSatisfiesOneFilter(allow, filter);
  const negative_satisfies = onePermissionSatisfiesOneFilter(deny, filter);

  return positive_satisfies && !negative_satisfies;
};

export const canAssignPermission = (permissions: defs.Permission[]) => (comparison_permission: defs.Permission) => {
  return satisfies(permissions, comparison_permission.action, comparison_permission.resource);
};

export const requireScoped = (permission: defs.Permission) => {
  return !!permission.resource.scope;
};

/**
 * If the permission contains a scoped resource, the scope must match the provided value. This is
 * to ensure that permissions within scoped Policies or Roles do not grant access over other
 * scoped resources.
 *
 * We allow unscoped resources to appear in scoped policies as this is necessary for allowing
 * access to the resource denoting the scope (`organization` for example)
 */
export const requireMatchingScope = (scope: string) => (permission: defs.Permission) => {
  if (permission.resource.scope == null) {
    return true;
  }
  return permission.resource.scope === scope;
};

export const requireUnscoped = (permission: defs.Permission) => {
  return !permission.resource.scope;
};

/**
 * Creates a Satisfier filter which checks that a permission matches (with wildcards) at least one of a given
 * set of models
 */
export const requireModel =
  (...models: string[]): Satisfier =>
  (permission: defs.Permission) => {
    return models.reduce((valid: boolean, model) => {
      if (valid) {
        return valid;
      }
      return compareWithWildcards(permission.resource.selector.model, model);
    }, false);
  };

/**
 * Creates a Satisfier filter which checks that a permission matches (with wildcards) at least one of a given
 * set of actions
 */
export const requireAction =
  (...actions: string[]): Satisfier =>
  (permission: defs.Permission) => {
    return actions.reduce((valid: boolean, action) => {
      if (valid) {
        return valid;
      }
      return compareWithWildcards(permission.action, action);
    }, false);
  };

/**
 * Given a set of permissions and a set of Satisfier filters, return the subset of permissions that pass
 * all of the given permissions
 */
export const filterPermissionsBy = (permissions: defs.Permission[], ...filters: Satisfier[]) => {
  return permissions.filter((permission) => {
    return utils.reduce(
      filters,
      (_: boolean, filter, reduced) => {
        const res = filter(permission);
        if (!res) {
          return reduced(res);
        }
        return res;
      },
      true
    );
  });
};
