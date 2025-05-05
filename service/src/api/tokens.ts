import * as cardinal from '@journeyapps-platform/types-cardinal';
import { DecodedToken, TokenWithoutValueResource } from '@journeyapps-platform/types-cardinal';
import * as micro from '@journeyapps-platform/micro';
import { MongoDB } from '../system/mongo';
import * as producer from './producer';
import * as query_utils from './utils';
import { createHash } from 'crypto';
import { System } from '../system';
import crypto from 'node:crypto';
import * as bson from 'bson';
import { CardinalModel } from '@journeyapps-platform/cardinal-catalog';
import { WithActor } from './utils';

export const createHashFromTokenValue = (value: string) => {
  const hash = createHash('sha256');
  hash.update(value);
  return hash.digest('hex');
};

export const getToken = async (mongo: MongoDB, id: string) => {
  return query_utils.getByIdOrThrow(mongo.tokens, id);
};

export const getTokenByValue = async (mongo: MongoDB, token: string) => {
  const res = await mongo.tokens.findOne({
    value: createHashFromTokenValue(token)
  });
  if (!res) {
    return null;
  }
  return micro.mongo.toJson(res);
};

type CreateTokenParams = WithActor<{
  token: cardinal.TokenWithoutValue;
}>;

/**
 We use a different prefix for pats primarily as a ux thing to help developers who consume the tokens.
 If a developer sees jpt_ in the string then they know it's a personal token they are using inside their .env file etc..
 */
export enum TokenPrefix {
  STANDARD = 'jat_',
  PAT = 'jpt_'
}

const generateStandardToken = (id: string) => {
  const random_nonce = crypto.randomBytes(20).toString('hex');
  const blob = Buffer.from(JSON.stringify({ i: id, n: random_nonce } as DecodedToken)).toString('base64');
  return `${TokenPrefix.STANDARD}${blob}`;
};

const generatePatToken = (id: string, user_id: string) => {
  const random_nonce = crypto.randomBytes(20).toString('hex');
  const blob = Buffer.from(JSON.stringify({ i: id, n: random_nonce, u: user_id } as DecodedToken)).toString('base64');
  return `${TokenPrefix.PAT}${blob}`;
};

const generateTokenV2 = (id: string, user_id?: string) => {
  if (user_id) {
    return generatePatToken(id, user_id);
  }
  return generateStandardToken(id);
};

export const createToken = async (system: System, params: CreateTokenParams) => {
  const { token } = params;

  const id = new bson.ObjectId();
  const token_value = generateTokenV2(id.toHexString(), params.token.user_id);
  const now = new Date();
  await system.mongo.tokens.insertOne({
    _id: id,

    description: token.description,
    value: createHashFromTokenValue(token_value),
    org_id: token.org_id,
    user_id: token.user_id,
    policy_ids: token.policy_ids,
    created_at: now,
    updated_at: now
  });

  const new_token = TokenWithoutValueResource.encode({
    ...token,
    created_at: now,
    updated_at: now,
    _id: id
  });

  await producer.produceAuthEvents(system, {
    actor: params.actor,
    events: {
      type: cardinal.TokenAuthEventType.TOKEN_CREATED,
      payload: new_token
    }
  });

  return {
    ...new_token,
    value: token_value
  };
};

export const stripTokenValue = <T extends cardinal.Token>(token: T) => {
  const { value, ...rest } = token;
  return rest;
};

export const deleteToken = async (system: System, params: WithActor<{ id: string }>) => {
  const token = await getToken(system.mongo, params.id);
  await system.mongo.tokens.deleteOne({
    _id: new bson.ObjectId(params.id)
  });

  await producer.produceAuthEvents(system, {
    actor: params.actor,
    events: {
      type: cardinal.TokenAuthEventType.TOKEN_DELETED,
      payload: micro.mongo.toJson(stripTokenValue(token))
    }
  });
};

type UpdateTokenParams = {
  token: cardinal.UpdateTokenParams;
};

export const updateToken = async (system: System, params: WithActor<UpdateTokenParams>) => {
  const { token } = params;

  const existing_token = await getToken(system.mongo, token.id);

  const update = {
    policy_ids: token.policy_ids,
    description: token.description,
    updated_at: new Date()
  };

  await system.mongo.tokens.updateOne(
    {
      _id: new bson.ObjectId(token.id)
    },
    {
      $set: update
    }
  );

  const new_token = stripTokenValue({
    ...existing_token,
    ...update
  });

  await producer.produceAuthEvents(system, {
    actor: params.actor,
    events: {
      type: cardinal.TokenAuthEventType.TOKEN_UPDATED,
      payload: micro.mongo.toJson(new_token)
    }
  });

  return new_token;
};

export const listUnscopedTokens = async (mongo: MongoDB) => {
  return mongo.tokens
    .find({
      org_id: {
        $exists: false
      },
      user_id: {
        $exists: false
      }
    })
    .map(micro.mongo.toJson)
    .map(stripTokenValue)
    .toArray();
};

export const listScopedTokensForOrganization = async (mongo: MongoDB, params: { org_id: string }) => {
  return mongo.tokens
    .find({
      org_id: params.org_id
    })
    .map(micro.mongo.toJson)
    .map(stripTokenValue)
    .toArray();
};

export const listPersonalTokensForUser = async (mongo: MongoDB, params: { user_id: string }) => {
  return mongo.tokens
    .find({
      user_id: params.user_id
    })
    .map(micro.mongo.toJson)
    .map(stripTokenValue)
    .toArray();
};

export const listTokens = async (
  system: System,
  params: query_utils.RequirePermissions<cardinal.V2ListResourceParams>
) => {
  const query = await query_utils.wrapQueryWithPermissions(system, {
    ...params,
    query: micro.mongo.findBy<cardinal.TokenResource>({
      id: params.id,
      org_id: params.org_id,
      user_id: params.user_id
    }),
    model: CardinalModel.TOKEN
  });

  return micro.mongo.paginate(system.mongo.tokens, {
    query: query,
    cursor: params.cursor,
    limit: params.limit || 100,
    transform: (token) => micro.mongo.toJson(stripTokenValue(token))
  });
};
