import { Managed } from './generics';
import * as t from 'ts-codec';
import { Resource } from '@journeyapps-platform/micro-codecs';

export enum MANAGED_ROLE {
  OWNER = 'Owner',
  DEVELOPER = 'Developer'
}

export const Role = t.object({
  name: t.string,
  org_id: t.string,
  policy_ids: t.array(t.string).optional()
});
export type Role = t.Encoded<typeof Role>;

export const RoleResource = Resource.and(Managed).and(Role);
export type RoleResource = t.Decoded<typeof RoleResource>;
export type SerializedRoleResource = t.Encoded<typeof RoleResource>;
