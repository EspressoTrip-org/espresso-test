import _ from 'lodash';

export namespace Utils {
  export const deepMerge = (destination: object, source: object) =>
    _.mergeWith(_.cloneDeep(destination), source, (objValue, srcValue) => {
      if (_.isArray(objValue)) {
        return _.union(srcValue, objValue);
      }
    });
}
