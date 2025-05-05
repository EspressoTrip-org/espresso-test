import * as t from 'ts-codec';
import { Actor, PolicyResource, RoleResource, TokenWithoutValueResource, UserResource } from '../definitions';

export enum PolicyAuthEventType {
  POLICY_CREATED = 'AUTH.POLICY_CREATED',
  POLICY_UPDATED = 'AUTH.POLICY_UPDATED',
  POLICY_DELETED = 'AUTH.POLICY_DELETED'
}

export enum RoleAuthEventType {
  ROLE_CREATED = 'AUTH.ROLE_CREATED',
  ROLE_UPDATED = 'AUTH.ROLE_UPDATED',
  ROLE_DELETED = 'AUTH.ROLE_DELETED'
}

export enum TokenAuthEventType {
  TOKEN_CREATED = 'AUTH.TOKEN_CREATED',
  TOKEN_UPDATED = 'AUTH.TOKEN_UPDATED',
  TOKEN_DELETED = 'AUTH.TOKEN_DELETED'
}

export enum UserAuthEventType {
  USER_ASSIGNMENTS_CHANGED = 'AUTH.USER_ASSIGNMENTS_CHANGED'
}

const AUTH_EVENT = {
  ...PolicyAuthEventType,
  ...RoleAuthEventType,
  ...TokenAuthEventType,
  ...UserAuthEventType
};

export type AUTH_EVENT = (typeof AUTH_EVENT)[keyof typeof AUTH_EVENT];

export const EventMetadata = t.object({
  actor: Actor
});
export type EventMetadata = t.Encoded<typeof EventMetadata>;

export const PolicyChangedEvent = t.object({
  type: t.Enum(PolicyAuthEventType),
  payload: PolicyResource,
  metadata: EventMetadata.optional()
});
export type PolicyChangedEvent = t.Encoded<typeof PolicyChangedEvent>;

export const RoleChangedEvent = t.object({
  type: t.Enum(RoleAuthEventType),
  payload: RoleResource,
  metadata: EventMetadata.optional()
});
export type RoleChangedEvent = t.Encoded<typeof RoleChangedEvent>;

export const TokenChangedEvent = t.object({
  type: t.Enum(TokenAuthEventType),
  payload: TokenWithoutValueResource,
  metadata: EventMetadata.optional()
});
export type TokenChangedEvent = t.Encoded<typeof TokenChangedEvent>;

export const UserAssignmentsChangedEvent = t.object({
  type: t.Enum(UserAuthEventType),
  payload: UserResource,
  metadata: EventMetadata.optional()
});
export type UserAssignmentsChangedEvent = t.Encoded<typeof UserAssignmentsChangedEvent>;

export enum AUTH_EVENT_SCHEMA_VERSION {
  V1 = 'V1'
}

export const AuthEvent = PolicyChangedEvent.or(RoleChangedEvent).or(TokenChangedEvent).or(UserAssignmentsChangedEvent);
export type AuthEvent = PolicyChangedEvent | RoleChangedEvent | TokenChangedEvent | UserAssignmentsChangedEvent;
