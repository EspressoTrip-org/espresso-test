import * as t from 'ts-codec';
import 'bson';
import { Scoped } from './generics';
import { Resource } from '@journeyapps-platform/micro-codecs';

export const Token = t.object({
  value: t.string,
  description: t.string.optional(),
  policy_ids: t.array(t.string).optional(),
  org_id: t.string.optional(),
  user_id: t.string.optional()
});
export type Token = t.Encoded<typeof Token>;

export const TokenWithoutValue = t.omit(Token, ['value']);
export type TokenWithoutValue = t.Encoded<typeof TokenWithoutValue>;

export const TokenResource = Resource.and(Token);
export type TokenResource = t.Decoded<typeof TokenResource>;
export type SerializedTokenResource = t.Encoded<typeof TokenResource>;

export const ScopedTokenResource = TokenResource.and(Scoped);
export type ScopedTokenResource = t.Decoded<typeof ScopedTokenResource>;
export type SerializedScopedTokenResource = t.Encoded<typeof ScopedTokenResource>;

export const TokenWithoutValueResource = Resource.and(TokenWithoutValue);
export type TokenWithoutValueResource = t.Decoded<typeof TokenWithoutValueResource>;
export type SerializedTokenWithoutValueResource = t.Encoded<typeof TokenWithoutValueResource>;

export const ScopedTokenWithoutValueResource = TokenWithoutValueResource.and(Scoped);
export type ScopedTokenWithoutValueResource = t.Decoded<typeof ScopedTokenWithoutValueResource>;
export type SerializedScopedTokenWithoutValueResource = t.Encoded<typeof ScopedTokenWithoutValueResource>;
