import * as t from 'ts-codec';

export enum USER_INVITE_EVENT {
  INVITE_ACCEPTED = 'USER.INVITE.ACCEPTED',
  INVITE_REVOKED = 'USER.INVITE.REVOKED',
  INVITE_UPDATED = 'USER.INVITE.UPDATED'
}

export const UserInvitePayload = t.object({
  id: t.string,
  user_id: t.string,
  org_id: t.string,
  roles_to_add_ids: t.array(t.string),
  roles_to_remove_ids: t.array(t.string)
});
export type UserInvitePayload = t.Encoded<typeof UserInvitePayload>;

export const UserInviteEvent = t.object({
  type: t.Enum(USER_INVITE_EVENT),
  payload: UserInvitePayload
});
export type UserInviteEvent = t.Encoded<typeof UserInviteEvent>;
