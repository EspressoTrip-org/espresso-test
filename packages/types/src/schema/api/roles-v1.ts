import * as defs from '../definitions';
import * as t from 'ts-codec';
import { ResourceId } from '@journeyapps-platform/micro-codecs';

export const ListRoleParams = t.object({
  org_id: t.string
});
export type ListRoleParams = t.Encoded<typeof ListRoleParams>;

export const CreateRoleParams = defs.Role;
export type CreateRoleParams = t.Encoded<typeof CreateRoleParams>;

export const CreateRoleResponse = defs.RoleResource;
export type CreateRoleResponse = t.Encoded<typeof CreateRoleResponse>;

export const UpdateRoleParams = ResourceId.and(t.omit(defs.Role, ['org_id']));
export type UpdateRoleParams = t.Encoded<typeof UpdateRoleParams>;

export const DeleteRoleParams = t.object({
  id: t.string
});
export type DeleteRoleParams = t.Encoded<typeof DeleteRoleParams>;
