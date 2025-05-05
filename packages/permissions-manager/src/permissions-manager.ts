import * as sdk_cardinal from '@journeyapps-platform/sdk-cardinal';
import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as sdk from '@journeyapps-platform/sdk-common';
import * as cache_managers from './cache-managers';
import * as event_streams from './event-streams';
import * as bson from 'bson';

const pickStatements = (policies: cardinal.Policy[]): cardinal.Policy[] => {
  return policies.map((policy) => {
    return {
      statements: policy.statements
    };
  });
};

export type CardinalPermissionsManagerOptions = {
  endpoint: string;
  client?: sdk.NodeNetworkClient;
  cache_manager?: cache_managers.CacheManager;
  event_stream?: event_streams.EventStream;
};
export class CardinalPermissionsManager {
  client: sdk_cardinal.CardinalClient<sdk.NodeNetworkClient>;
  options: CardinalPermissionsManagerOptions;
  cache_manager: cache_managers.CacheManager;

  constructor(options: CardinalPermissionsManagerOptions) {
    this.options = options;
    this.cache_manager = options.cache_manager || cache_managers.createNoopCacheManager();

    this.options.event_stream?.subscribe(this.handleAuthEvent);

    let network_client = options.client;
    if (!network_client) {
      network_client = sdk.createNodeNetworkClient();
    }

    this.client = new sdk_cardinal.CardinalClient({
      endpoint: this.options.endpoint,
      client: network_client
    });
  }

  handleAuthEvent = async (event: cardinal.AuthEvent) => {
    switch (event.type) {
      case cardinal.UserAuthEventType.USER_ASSIGNMENTS_CHANGED: {
        await this.cache_manager.invalidatePrincipal(event.payload.id);
        break;
      }
      case cardinal.PolicyAuthEventType.POLICY_DELETED:
      case cardinal.PolicyAuthEventType.POLICY_UPDATED: {
        await this.cache_manager.invalidatePolicy(event.payload.id);
        break;
      }
    }
  };

  async getPoliciesForUser(principal: { id: string }) {
    const cached_policies = await this.cache_manager.getPoliciesForPrincipal(principal.id);
    if (cached_policies) {
      return pickStatements(cached_policies);
    }

    const policies = await this.client.getPoliciesForUser({
      user_id: principal.id
    });

    /**
     * A policy query can return 'virtual' policies that exist only in memory (do not have id's). In this
     * case we generate placeholder ids for them for storing in the cache. These policies are invalidated
     * through principal level events (USER_ASSIGNMENTS_CHANGED, TOKEN_UPDATED; for example)
     */
    const normalized_policy_list = policies.map((policy) => {
      if ('id' in policy) {
        return policy;
      }
      return {
        id: new bson.ObjectId().toHexString(),
        ...policy
      };
    });

    await this.cache_manager.setPoliciesForPrincipal(principal.id, normalized_policy_list);
    return pickStatements(policies);
  }
  async getPermissionsForUser(principal: { id: string }) {
    const policies = await this.getPoliciesForUser(principal);
    return cardinal.createPermissionsFromPolicies(policies);
  }

  async getPoliciesForToken(principal: { token: string }) {
    const policies = await this.client.getPoliciesForToken(
      {
        token: principal.token
      },
      {
        headers: {
          Authorization: `Bearer ${principal.token}`
        }
      }
    );
    return pickStatements(policies);
  }
  async getPermissionsForToken(principal: { token: string }) {
    const policies = await this.getPoliciesForToken(principal);
    return cardinal.createPermissionsFromPolicies(policies);
  }
}
