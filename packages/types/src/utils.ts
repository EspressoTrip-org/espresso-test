import * as defs from './schema/definitions';

export interface DecodedToken {
  /**
   * Token id
   */
  i: string;
  /*
    User id (if PAT)
   */
  u?: string;
  n: string;
}

/**
 * An alternative implementation of the native Array.reduce() which allows exiting early
 * from iteration. This is useful for reducing work when looping over large arrays
 *
 * This is implemented through the third parameter provided to the item callback called
 * `reduced` which when called will break out of iteration
 */
export const reduce = <T, R>(arr: T[], cb: (acc: R, item: T, reduced: (value: R) => R) => R, init: R) => {
  let state = init;
  let done = false;
  for (const item of arr) {
    state = cb(state, item, (value) => {
      done = true;
      return value;
    });

    if (done) {
      break;
    }
  }
  return state;
};

export const isIDResourceSelector = (
  selector: defs.IDResourceSelector | defs.LabelResourceSelector
): selector is defs.IDResourceSelector => {
  return 'id' in selector;
};

export const isLabelResourceSelector = (
  selector: defs.IDResourceSelector | defs.LabelResourceSelector
): selector is defs.LabelResourceSelector => {
  return 'labels' in selector;
};

export const castToArray = (field: string | string[]) => {
  if (Array.isArray(field)) {
    return field;
  }
  return [field];
};

/**
 * Neither left nor right can be empty (strict comparison) and right needs to be a subset
 * of left.
 *
 * To illustrate:
 *
 * [], [] // false
 * ['a'], [] // false
 * [], ['b'] // false
 * ['a', 'b'], ['a'] // true
 * ['a'], ['a', 'b'] // false
 */
export const strictlyContains = (left: string[], right: string[]) => {
  if (left.length === 0 || right.length === 0) {
    return false;
  }

  const additional = right.filter((element) => {
    return !left.includes(element);
  });
  return additional.length === 0;
};

export const splitByEffect = (permissions: defs.Permission[]) => {
  return permissions.reduce(
    (groups: { allow: defs.Permission[]; deny: defs.Permission[] }, permission) => {
      switch (permission.effect) {
        case defs.PERMISSION_EFFECT.Deny: {
          groups.deny.push(permission);
          return groups;
        }

        case defs.PERMISSION_EFFECT.Allow:
        default: {
          groups.allow.push(permission);
          return groups;
        }
      }
    },
    { allow: [], deny: [] }
  );
};

/**
 * Utility function to determine if a string is a Cardinal token
 */
const UUID_V4_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
const V2TOKEN_REGEX = /^(jat|jpt)_(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/i;
export const isCardinalToken = (token: string) => {
  return UUID_V4_REGEX.test(token) || V2TOKEN_REGEX.test(token);
};

export const parseToken = (token: string): DecodedToken | null => {
  if (V2TOKEN_REGEX.test(token)) {
    const [prefix, blob] = token.split('_');
    const json = Buffer.from(blob, 'base64').toString('ascii');
    return JSON.parse(json);
  }
  return null;
};

export const SYSTEM_ACTOR: defs.SystemActor = {
  type: defs.ActorType.System
};
