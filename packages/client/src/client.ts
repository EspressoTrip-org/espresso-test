import type * as bson from 'bson';

import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro_db from '@journeyapps-platform/micro-db';
import * as sdk from '@journeyapps-platform/sdk-common';

export class CardinalClient<C extends sdk.NetworkClient> extends sdk.SDKClient<C> {
  // queries

  getPoliciesForUser = this.createEndpoint<cardinal.QueryPoliciesForUser, cardinal.PolicyQueryResponse>({
    path: cardinal.ROUTES_V2.QUERY_POLICIES_FOR_USER,
    retryable: true
  });
  async getPermissionsForUser(params: cardinal.QueryPoliciesForUser) {
    const policies = await this.getPoliciesForUser(params);
    return cardinal.createPermissionsFromPolicies(policies);
  }

  getPoliciesForToken = this.createEndpoint<cardinal.QueryPoliciesForToken, cardinal.PolicyQueryResponse>({
    path: cardinal.ROUTES_V2.QUERY_POLICIES_FOR_TOKEN,
    retryable: true
  });
  async getPermissionsForToken(params: cardinal.QueryPoliciesForToken) {
    const policies = await this.getPoliciesForToken(params);
    return cardinal.createPermissionsFromPolicies(policies);
  }

  // tokens

  listTokens = sdk.createPaginatedEndpoint(
    this.createEndpoint<
      cardinal.V2ListResourceParams,
      micro_db.PaginationResponse<cardinal.SerializedTokenWithoutValueResource>
    >({
      path: cardinal.ROUTES_V2.LIST_TOKENS,
      retryable: true
    })
  );

  createScopedToken = this.createEndpoint<cardinal.CreateScopedTokenParams, cardinal.SerializedScopedTokenResource>({
    path: cardinal.ROUTES_V2.CREATE_SCOPED_TOKEN
  });
  createUnscopedToken = this.createEndpoint<cardinal.CreateUnscopedTokenParams, cardinal.SerializedTokenResource>({
    path: cardinal.ROUTES_V2.CREATE_UNSCOPED_TOKEN
  });
  createPersonalToken = this.createEndpoint<cardinal.CreatePersonalTokenParams, cardinal.SerializedScopedTokenResource>(
    {
      path: cardinal.ROUTES_V2.CREATE_PERSONAL_TOKEN
    }
  );

  updateToken = this.createEndpoint<cardinal.UpdateTokenParams, cardinal.SerializedTokenWithoutValueResource>({
    path: cardinal.ROUTES_V2.UPDATE_TOKEN
  });
  deleteToken = this.createEndpoint<cardinal.DeleteTokenParams, boolean>({
    path: cardinal.ROUTES_V2.DELETE_TOKEN
  });

  // roles

  listRoles = sdk.createPaginatedEndpoint(
    this.createEndpoint<cardinal.V2ListResourceParams, micro_db.PaginationResponse<cardinal.SerializedRoleResource>>({
      path: cardinal.ROUTES_V2.LIST_ROLES,
      retryable: true
    })
  );
  createRole = this.createEndpoint<cardinal.CreateRoleParams, cardinal.SerializedRoleResource>({
    path: cardinal.ROUTES_V2.CREATE_ROLE
  });
  updateRole = this.createEndpoint<cardinal.UpdateRoleParams, cardinal.SerializedRoleResource>({
    path: cardinal.ROUTES_V2.UPDATE_ROLE
  });
  deleteRole = this.createEndpoint<cardinal.DeleteRoleParams, boolean>({
    path: cardinal.ROUTES_V2.DELETE_ROLE
  });

  // policies

  listPolicies = sdk.createPaginatedEndpoint(
    this.createEndpoint<cardinal.V2ListResourceParams, micro_db.PaginationResponse<cardinal.SerializedPolicyResource>>({
      path: cardinal.ROUTES_V2.LIST_POLICIES,
      retryable: true
    })
  );
  createScopedPolicy = this.createEndpoint<cardinal.CreateScopedTokenParams, cardinal.SerializedScopedPolicyResource>({
    path: cardinal.ROUTES_V2.CREATE_SCOPED_POLICY
  });
  createUnscopedPolicy = this.createEndpoint<
    cardinal.CreateUnscopedTokenParams,
    cardinal.SerializedUnscopedPolicyResource
  >({
    path: cardinal.ROUTES_V2.CREATE_UNSCOPED_POLICY
  });
  updatePolicy = this.createEndpoint<cardinal.UpdatePolicyParams, cardinal.SerializedPolicyResource>({
    path: cardinal.ROUTES_V2.UPDATE_POLICY
  });
  deletePolicy = this.createEndpoint<cardinal.DeletePolicyParams, boolean>({
    path: cardinal.ROUTES_V2.DELETE_POLICY
  });

  getPolicyAssignments = this.createEndpoint<
    cardinal.V2GetPolicyAssignmentsParams,
    cardinal.V2GetPolicyAssignmentsResponse
  >({
    path: cardinal.ROUTES_V2.GET_POLICY_ASSIGNMENTS,
    retryable: true
  });

  // users

  getUserAssignments = this.createEndpoint<cardinal.V2GetUserAssignmentParams, cardinal.SerializedUserResource>({
    path: cardinal.ROUTES_V2.GET_USER_ASSIGNMENTS,
    retryable: true
  });

  assignPolicyToUser = this.createEndpoint<
    cardinal.V2UpdateUserPolicyAssignmentParams,
    cardinal.SerializedUserResource
  >({
    path: cardinal.ROUTES_V2.ASSIGN_POLICY_TO_USER
  });
  unassignPolicyFromUser = this.createEndpoint<
    cardinal.V2UpdateUserPolicyAssignmentParams,
    cardinal.SerializedUserResource
  >({
    path: cardinal.ROUTES_V2.UNASSIGN_POLICY_FROM_USER
  });

  assignRoleToUser = this.createEndpoint<cardinal.V2UpdateUserRoleAssignmentParams, cardinal.SerializedUserResource>({
    path: cardinal.ROUTES_V2.ASSIGN_ROLE_TO_USER
  });
  unassignRoleFromUser = this.createEndpoint<
    cardinal.V2UpdateUserRoleAssignmentParams,
    cardinal.SerializedUserResource
  >({
    path: cardinal.ROUTES_V2.UNASSIGN_ROLE_FROM_USER
  });
}
