import * as micro_auth from '@journeyapps-platform/micro-authorizers';
import * as sdk_cardinal from '@journeyapps-platform/sdk-cardinal';
import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as permissions_manager from './permissions-manager';

type Client = sdk_cardinal.CardinalClient<any> | permissions_manager.CardinalPermissionsManager;

export type CardinalTokenClaim = {
  /**
   * note: V1 tokens will not contain this field
   */
  token_id?: string;
  /**
   * note: V1 tokens will not contain this field
   * Will be set if the claim originates from a PAT
   */
  user_id?: string;
  policies: cardinal.Policy[];
};

export const createCardinalTokenDecoder = (client: Client): micro_auth.MicroDecoder<CardinalTokenClaim> => {
  return {
    async decode(token: string) {
      if (!token || !cardinal.isCardinalToken(token)) {
        throw new Error('Unsupported token');
      }

      const token_decoded = cardinal.parseToken(token);

      const policies = await client.getPoliciesForToken({
        token: token
      });

      return {
        token_id: token_decoded?.i,
        user_id: token_decoded?.u,
        policies: policies.map((policy) => {
          return {
            statements: policy.statements
          };
        })
      };
    }
  };
};
