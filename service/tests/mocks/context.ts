import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro from '@journeyapps-platform/micro';
import { System } from '../../src/system';
import * as auth from '../../src/auth';
import * as express from 'express';

export const createMockedContext = (system: System, policies: cardinal.RawPolicy[]): auth.Context => {
  const viewer: auth.Viewer = {
    permissions: cardinal.createPermissionsFromPolicies(policies),
    policies: policies,
    token: '',
    errors: [],
    actor: cardinal.SYSTEM_ACTOR,
    can: async (action, model, id, speculative_data) => {
      const can_access = await system.resolver.canAccessResource({
        policies: policies,
        speculative_data: speculative_data,
        actions: Array.isArray(action) ? action : [action],
        model: model,
        id: id
      });

      return {
        authorized: can_access
      };
    }
  };

  return {
    viewer: viewer,
    sha: 'tests',
    system: system
  };
};

type Params<I> = {
  params: I;
  system: System;
  policies: cardinal.RawPolicy[];
};
export const createMockedPayload = <I>(params: Params<I>): any => {
  return {
    response: {} as express.Response,
    request: {} as express.Request,
    params: params.params,
    context: createMockedContext(params.system, params.policies)
  };
};
