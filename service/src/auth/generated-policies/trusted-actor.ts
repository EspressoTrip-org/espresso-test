import * as cardinal from '@journeyapps-platform/types-cardinal';
import { CardinalModel } from '@journeyapps-platform/cardinal-catalog';

/**
 * This policy is assigned to any viewer with a claim containing `trusted_actor`. It gives a holder the ability
 * to read tokens, users and policies for all scoped and unscoped resource variations
 */
export const trusted_actor_policy: cardinal.Policy = {
  statements: [
    {
      actions: ['read'],
      resources: [
        {
          scope: '*',
          selector: {
            model: CardinalModel.USER,
            id: '*'
          }
        },
        {
          scope: '*',
          selector: {
            model: CardinalModel.TOKEN,
            id: '*'
          }
        },
        {
          selector: {
            model: CardinalModel.TOKEN,
            id: '*'
          }
        },
        {
          scope: '*',
          selector: {
            model: CardinalModel.POLICY,
            id: '*'
          }
        },
        {
          selector: {
            model: CardinalModel.POLICY,
            id: '*'
          }
        },
        {
          scope: '*',
          selector: {
            model: CardinalModel.ROLE,
            id: '*'
          }
        },
        {
          selector: {
            model: CardinalModel.ROLE,
            id: '*'
          }
        }
      ]
    }
  ]
};
