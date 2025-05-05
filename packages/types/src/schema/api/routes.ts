export enum ROUTES_V2 {
  LIST_POLICIES = '/api/cardinal/v2/policies/list',
  LIST_ROLES = '/api/cardinal/v2/roles/list',
  LIST_TOKENS = '/api/cardinal/v2/tokens/list',

  CREATE_SCOPED_POLICY = '/api/cardinal/v2/policies/create-scoped-policy',
  CREATE_UNSCOPED_POLICY = '/api/cardinal/v2/policies/create-unscoped-policy',
  UPDATE_POLICY = '/api/cardinal/v2/policies/update',
  DELETE_POLICY = '/api/cardinal/v2/policies/delete',

  CREATE_PERSONAL_TOKEN = '/api/cardinal/v2/tokens/create-personal-token',
  CREATE_SCOPED_TOKEN = '/api/cardinal/v2/tokens/create-scoped-token',
  CREATE_UNSCOPED_TOKEN = '/api/cardinal/v2/tokens/create-unscoped-token',
  UPDATE_TOKEN = '/api/cardinal/v2/tokens/update',
  DELETE_TOKEN = '/api/cardinal/v2/tokens/delete',

  CREATE_ROLE = '/api/cardinal/v2/roles/create',
  UPDATE_ROLE = '/api/cardinal/v2/roles/update',
  DELETE_ROLE = '/api/cardinal/v2/roles/delete',

  GET_USER_ASSIGNMENTS = '/api/cardinal/v2/assignments/get-user-assignments',
  ASSIGN_POLICY_TO_USER = '/api/cardinal/v2/assignments/assign-policy-to-user',
  UNASSIGN_POLICY_FROM_USER = '/api/cardinal/v2/assignments/unassign-policy-from-user',
  ASSIGN_ROLE_TO_USER = '/api/cardinal/v2/assignments/assign-role-to-user',
  UNASSIGN_ROLE_FROM_USER = '/api/cardinal/v2/assignments/unassign-role-from-user',
  GET_POLICY_ASSIGNMENTS = '/api/cardinal/v2/assignments/get-policy-assignments',

  QUERY_POLICIES_FOR_USER = '/api/cardinal/v2/query/user-policies',
  QUERY_POLICIES_FOR_TOKEN = '/api/cardinal/v2/query/token-policies'
}
