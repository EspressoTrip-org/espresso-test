import * as cardinal from '@journeyapps-platform/types-cardinal';
import { ViewerActor } from '../../auth';
import * as _ from 'lodash';

const IS_VARIABLE = /^\$.*/;

type Interpolator = (field: cardinal.StringOr) => cardinal.StringOr;

type Values = {
  actor?: ViewerActor;
  [key: string]: any;
};

const interpolator =
  (values: Values): Interpolator =>
  (field) => {
    const interpolated = cardinal.castToArray(field).map((value) => {
      if (!IS_VARIABLE.test(value)) {
        return value;
      }
      return _.get(values, value.substring(1)) || value;
    });
    if (interpolated.length === 1) {
      return interpolated[0];
    }
    return interpolated;
  };

const interpolateSelector = (interpolate: Interpolator) => (selector: cardinal.ResourceSelector) => {
  let new_selector: cardinal.ResourceSelector;
  if (cardinal.isIDResourceSelector(selector)) {
    new_selector = {
      model: interpolate(selector.model),
      id: interpolate(selector.id)
    };
  } else {
    new_selector = {
      model: interpolate(selector.model),
      labels: _.mapValues(selector.labels, (value) => {
        return interpolate(value);
      })
    };
  }

  if (selector.parents) {
    new_selector.parents = selector.parents.map(interpolateSelector(interpolate));
  }

  return new_selector;
};

/**
 * Performs variable substitution for all values within a policy
 *
 * Given `values` must be sanitized to prevent accidental leakage of private/hidden information
 */
export const interpolateTemplatePolicy = <T extends cardinal.Policy>(policy: T, values: Values): T => {
  const interpolate = interpolator(values);
  const statements = policy.statements.map((statement) => {
    return {
      ...statement,
      resources: statement.resources.map((resource) => {
        return {
          scope: resource.scope ? interpolate(resource.scope) : undefined,
          selector: interpolateSelector(interpolate)(resource.selector)
        } as cardinal.Resource;
      })
    };
  });

  return {
    ...policy,
    statements: statements
  };
};
