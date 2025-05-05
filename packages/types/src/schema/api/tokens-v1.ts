import * as defs from '../definitions';
import { Personal, Scoped } from '../definitions';
import * as t from 'ts-codec';
import { ResourceId } from '@journeyapps-platform/micro-codecs';

export const ListScopedTokenParams = t.object({
  org_id: t.string
});

export type ListScopedTokenParams = t.Encoded<typeof ListScopedTokenParams>;

export const CreateUnscopedTokenParams = t.omit(defs.TokenWithoutValue, ['org_id']);
export type CreateUnscopedTokenParams = t.Encoded<typeof CreateUnscopedTokenParams>;

export const CreateScopedTokenParams = defs.TokenWithoutValue.and(Scoped);
export type CreateScopedTokenParams = t.Encoded<typeof CreateScopedTokenParams>;

export const CreatePersonalTokenParams = t.omit(defs.TokenWithoutValue, ['org_id']).and(Personal);
export type CreatePersonalTokenParams = t.Encoded<typeof CreatePersonalTokenParams>;

export const UpdateTokenParams = ResourceId.and(t.omit(defs.TokenWithoutValue, ['org_id', 'user_id']));
export type UpdateTokenParams = t.Encoded<typeof UpdateTokenParams>;

export const DeleteTokenParams = t.object({
  id: t.string
});
export type DeleteTokenParams = t.Encoded<typeof DeleteTokenParams>;
