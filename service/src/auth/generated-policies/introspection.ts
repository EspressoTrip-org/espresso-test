import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro from '@journeyapps-platform/micro';

type CanReadOwnPolicyParams = {
  model: 'user' | 'token';
  id: string;
  scope?: string;
  policies: Array<cardinal.Policy | micro.db.ID<cardinal.Policy>>;
};

export const canReadOwnPolicies = (params: CanReadOwnPolicyParams): cardinal.Policy[] => {
  // Allow the actor to read itself
  const policy_for_self: cardinal.Policy = {
    statements: [
      {
        actions: ['read'],
        resources: [
          {
            scope: params.scope,
            selector: {
              model: params.model,
              id: params.id
            }
          }
        ]
      }
    ]
  };

  // Allow the actor to read the policies assigned to it
  return params.policies.concat([
    policy_for_self,
    {
      statements: [
        {
          actions: ['read'],
          resources: params.policies
            .filter((policy) => 'id' in policy)
            .map((policy) => {
              return {
                scope: policy.org_id,
                selector: {
                  model: 'policy',
                  id: (policy as micro.db.SerializedId & cardinal.Policy).id
                }
              };
            })
        }
      ]
    }
  ]);
};
