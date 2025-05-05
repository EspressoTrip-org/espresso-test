import { describe, test, expect } from 'vitest';

import * as ref_clone from '../src/referential-clone';

describe('referential cloning', () => {
  test('a referentially cloned DB should maintain operations correctly', () => {
    const dataset: [number, number][] = [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4]
    ];
    const original_data = new Map(dataset);

    const clone = ref_clone.referentialDiffClone(original_data);

    expect(clone.toNativeMap?.()).toEqual(original_data);

    clone.set(5, 5);
    expect(clone.toNativeMap?.()).not.toEqual(original_data);
    expect(clone.toNativeMap?.()).toEqual(new Map([...dataset, [5, 5]]));

    clone.delete(4);
    expect(clone.toNativeMap?.()).toEqual(new Map([...dataset.slice(0, dataset.length - 1), [5, 5]]));

    expect(new Map(dataset)).toEqual(original_data);

    clone.set(4, 5);
    expect(clone.toNativeMap?.()).toEqual(new Map([...dataset.slice(0, dataset.length - 1), [5, 5], [4, 5]]));
    expect(clone.get(4)).toEqual(5);

    const data: number[] = [];
    clone.forEach((value) => {
      data.push(value);
    });
    expect(data).toEqual([1, 2, 3, 5, 5]);
  });
});
