import * as defs from './definitions';

/**
 * Perform a 'referential' clone of the given Map. This provides a highly performant method of
 * creating a 'speculative' map in which operations against do not affect the original.
 *
 * A limitation of this approach is that any operations performed against the original will
 * impact the cloned version. This shouldn't be an issue for our usage but it is something
 * to keep in mind when building against.
 *
 * Additionally it is important to understand that raw iteration of a cloned Map is around
 * 2-3x slower than iteration on the original - and continues as such for nested clones.
 *
 * This overhead is more or less negligible for our use-case as the expense of resolving
 * policies far outweighs the iteration overhead.
 *
 * For reference - iterating a native map of 1M entries takes 8ms while a cloned map takes
 * around 20-24ms. This is on my personal machine and is not scientific in any way - more
 * just a point of reference
 */
export const referentialDiffClone = <K, V>(reference: defs.MapSubset<K, V>): defs.MapSubset<K, V> => {
  const delta = new Map<K, V>();
  const deletions = new Set<K>();

  return {
    has(key) {
      if (delta.has(key)) {
        return true;
      }
      if (deletions.has(key)) {
        return false;
      }
      return reference.has(key);
    },
    get(key) {
      const value = delta.get(key);
      if (value) {
        return value;
      }
      if (deletions.has(key)) {
        return;
      }
      return reference.get(key);
    },
    set(key, value) {
      delta.set(key, value);
      deletions.delete(key);
    },
    delete(key) {
      delta.delete(key);
      deletions.add(key);
    },
    forEach(cb) {
      reference.forEach((value, key) => {
        if (!deletions.has(key) && !delta.has(key)) {
          cb(value, key);
        }
      });
      delta.forEach(cb);
    },

    /**
     * This is really only intended to be used for testing - to allow comparing the data between
     * two maps
     */
    toNativeMap() {
      const map = new Map<K, V>();
      this.forEach((value, key) => {
        map.set(key, value);
      });
      return map;
    }
  };
};
