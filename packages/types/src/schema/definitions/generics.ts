import * as t from 'ts-codec';

export const Scoped = t.object({
  org_id: t.string
});
export type Scoped = t.Encoded<typeof Scoped>;

export const Personal = t.object({
  user_id: t.string
});
export type Personal = t.Encoded<typeof Personal>;

export const Managed = t.object({
  managed: t.boolean.optional()
});
export type Managed = t.Encoded<typeof Managed>;

export enum ActorType {
  System = 'system',
  User = 'user',
  Token = 'token'
}

export const SystemActor = t.object({
  type: t.literal(ActorType.System)
});
export type SystemActor = t.Encoded<typeof SystemActor>;

export const Actor = SystemActor.or(
  t.object({
    id: t.string,
    type: t.literal(ActorType.Token).or(t.literal(ActorType.User))
  })
);
export type Actor = t.Encoded<typeof Actor>;
