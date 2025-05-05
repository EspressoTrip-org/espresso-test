import * as t from 'ts-codec';
import { ResourceId } from '@journeyapps-platform/micro-codecs';

export const User = t.object({
  email: t.string,
  policy_ids: t.array(t.string).optional(),
  role_ids: t.array(t.string).optional(),
  org_id: t.string
});
export type User = t.Encoded<typeof User>;

export const UserResource = ResourceId.and(User);
export type UserResource = t.Decoded<typeof UserResource>;
export type SerializedUserResource = t.Encoded<typeof UserResource>;
