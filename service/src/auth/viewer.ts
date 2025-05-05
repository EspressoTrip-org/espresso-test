import * as resolver from '@journeyapps-platform/recon-entity-resolver';
import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as generated_policies from './generated-policies';
import * as micro from '@journeyapps-platform/micro';
import * as errors from '../errors';
import { System } from '../system';
import * as api from '../api';
import * as _ from 'lodash';
import * as t from 'zod';
import { URL } from 'url';
import { CardinalModel } from '@journeyapps-platform/cardinal-catalog';

const Claim = t
  .object({
    user_id: t.string(),
    trusted_actor: t.boolean()
  })
  .partial();
export type Claim = t.infer<typeof Claim>;

export type ViewerActor = cardinal.Actor & {
  org_id?: string;
};

export type BaseClaimProperties = {
  policies: cardinal.Policy[];
  actor?: ViewerActor;
};

export type JWTClaim = micro.auth.JWTClaim & Claim & BaseClaimProperties;

export type ViewerClaim = JWTClaim | BaseClaimProperties;

export const isJWTClaim = (claim?: ViewerClaim): claim is JWTClaim => {
  return !!claim && 'user_id' in claim;
};

export type Viewer = micro.auth.Viewer<ViewerClaim> & {
  can: (
    action: cardinal.StringOr,
    resource: CardinalModel.POLICY | CardinalModel.TOKEN | CardinalModel.USER | CardinalModel.ROLE,
    id: string,
    speculative?: resolver.SpeculativeData
  ) => Promise<micro.router.AuthorizationResponse>;
  policies: cardinal.Policy[];
  permissions: cardinal.Permission[];
  actor: cardinal.Actor;
};

type CreateJWTDecoderParams = {
  issuer_url: string;
  verify?: boolean;
};

export const createJWTDecoder = (
  system: System,
  params: CreateJWTDecoderParams
): micro.auth.MicroDecoder<ViewerClaim> => {
  const validator = micro.schema.createZodValidator(Claim);

  const issuer_url = new URL('/.well-known/jwks.json', params.issuer_url);
  const decoder = micro.auth.createJWTDecoder({
    keystore: micro.auth.createKeyStore({
      collector: micro.auth.createHttpCollector(issuer_url.toString())
    }),

    issuer: params.issuer_url,
    audience: ['cardinal.journeyapps.com', 'journeyapps.com'],

    verify: params.verify,
    validator: validator
  });

  const derivePoliciesFromClaim = async (claim: Claim): Promise<BaseClaimProperties> => {
    if (claim.trusted_actor) {
      return {
        actor: {
          type: cardinal.ActorType.System
        },
        policies: [generated_policies.trusted_actor_policy]
      };
    }
    if (!claim.user_id) {
      return {
        policies: []
      };
    }
    const user = await api.users.getUser(system.mongo, claim.user_id);
    const policies = await api.policies.getPoliciesForUser(system, {
      user_id: claim.user_id
    });
    return {
      policies: generated_policies.canReadOwnPolicies({
        model: 'user',
        scope: user.org_id,
        id: claim.user_id,
        policies
      }),
      actor: {
        type: cardinal.ActorType.User,
        id: claim.user_id,
        org_id: user.org_id
      }
    };
  };

  return {
    decode: async (token) => {
      const claim = await decoder.decode(token);
      return {
        ...claim,
        ...(await derivePoliciesFromClaim(claim))
      };
    }
  };
};

export type TokenDecoder = micro.auth.MicroDecoder<BaseClaimProperties>;

export const createTokenDecoder = (system: System): TokenDecoder => {
  return {
    async decode(value: string) {
      const token = await api.tokens.getTokenByValue(system.mongo, value);
      if (!token) {
        throw new errors.Error404('token', '<redacted>');
      }

      const policies = await api.policies.getPoliciesForToken(system, {
        token_id: token.id
      });

      return {
        policies: generated_policies.canReadOwnPolicies({
          model: 'token',
          id: token.id,
          scope: token.org_id,
          policies
        }),
        actor: {
          type: cardinal.ActorType.Token,
          id: token.id,
          org_id: token.org_id
        }
      };
    }
  };
};

export const createDevDecoder = (): TokenDecoder => {
  return {
    async decode() {
      return {
        policies: [
          {
            statements: [
              {
                actions: ['*'],
                resources: [
                  {
                    scope: '*',
                    selector: {
                      model: '*',
                      id: '*'
                    }
                  },
                  {
                    selector: {
                      model: '*',
                      id: '*'
                    }
                  }
                ]
              }
            ]
          }
        ],
        actor: {
          type: cardinal.ActorType.System
        }
      };
    }
  };
};

export const createViewer = async (params: {
  token: string;
  system: System;
  decoders: micro.auth.MicroDecoder<ViewerClaim>[];
}): Promise<Viewer> => {
  const viewer = await micro.auth.createViewer({
    token: params.token,
    decoder: micro.auth.createCompoundDecoder({
      decoders: params.decoders
    })
  });

  const policies = viewer.claim?.policies || [];
  let permissions: cardinal.Permission[] | null = null;

  return {
    ...viewer,
    get policies() {
      return policies;
    },
    get permissions() {
      if (permissions) {
        return permissions;
      }
      return cardinal.createPermissionsFromPolicies(policies);
    },
    get actor() {
      if (!viewer.claim?.actor) {
        throw new Error('unknown actor');
      }
      return _.pick(viewer.claim.actor, ['type', 'id']) as cardinal.Actor;
    },
    can: async (action, model, id, speculative_data) => {
      const can_access = await params.system.resolver.canAccessResource({
        policies: policies,
        speculative_data: speculative_data,
        actions: Array.isArray(action) ? action : [action],
        model: model,
        id: id
      });

      if (!can_access) {
        return {
          authorized: false,
          errors: [`unauthorized to ${action} on ${model}/${id}`, ...viewer.errors]
        };
      }

      return {
        authorized: true
      };
    }
  };
};
