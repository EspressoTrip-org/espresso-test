import * as t from 'ts-codec';

export const StringOr = t.string.or(t.array(t.string));
export type StringOr = t.Encoded<typeof StringOr>;

export const IDResourceSelector = t.object({
  id: StringOr
});
export type IDResourceSelector = t.Encoded<typeof IDResourceSelector>;

export const SelectorLabels = t.record(StringOr);
export type SelectorLabels = t.Encoded<typeof SelectorLabels>;

export const LabelResourceSelector = t.object({
  labels: SelectorLabels
});
export type LabelResourceSelector = t.Encoded<typeof LabelResourceSelector>;

export type ResourceSelector = (IDResourceSelector | LabelResourceSelector) & {
  model: StringOr;
  parents?: ResourceSelector[];
};

export const ResourceSelector: t.Codec<ResourceSelector, ResourceSelector> = t.recursive('ResourceSelector', () => {
  return IDResourceSelector.or(LabelResourceSelector).and(
    t.object({
      model: StringOr,
      parents: t.array(ResourceSelector).optional()
    })
  );
});

export const Resource = t.object({
  scope: StringOr.optional(),
  selector: ResourceSelector
});
export type Resource = t.Encoded<typeof Resource>;

export enum PERMISSION_EFFECT {
  Allow = 'Allow',
  Deny = 'Deny'
}

export const Permission = t.object({
  effect: t.Enum(PERMISSION_EFFECT).optional(),
  action: StringOr,
  resource: Resource
});

export type Permission = t.Encoded<typeof Permission>;
