import { describe, it, expect } from 'vitest';

import { reduceValidStatements } from '../src/reduce-policies';
import * as types from '@journeyapps-platform/types-cardinal';

describe('statement-filtering', () => {
  const fixtures: types.RawPolicy[] = [
    {
      statements: [
        {
          actions: ['a', 'b'],
          resources: [
            {
              scope: '123',
              selector: {
                model: 'waffle',
                id: '*'
              }
            }
          ]
        },
        {
          actions: ['c'],
          resources: [
            {
              scope: '123',
              selector: {
                model: 'waffle',
                id: '*'
              }
            }
          ]
        }
      ]
    },
    {
      statements: [
        {
          actions: ['d'],
          resources: [
            {
              scope: '123',
              selector: {
                model: 'waffle',
                id: '*'
              }
            }
          ]
        }
      ]
    },
    {
      statements: [
        {
          actions: ['d'],
          resources: [
            {
              scope: '123',
              selector: {
                model: 'not-waffle',
                id: '*'
              }
            }
          ]
        }
      ]
    }
  ];

  it('should handle a single element actions array', () => {
    expect(reduceValidStatements(fixtures, ['a'], 'waffle')).toMatchSnapshot();
    expect(reduceValidStatements(fixtures, ['b'], 'waffle')).toMatchSnapshot();
    expect(reduceValidStatements(fixtures, ['d'], 'waffle')).toMatchSnapshot();
  });

  it("should handle multiple actions with 'or'", () => {
    expect(reduceValidStatements(fixtures, ['a', 'd'], 'waffle')).toMatchSnapshot();
  });
});
