import * as t from 'ts-codec';
import { Resource } from '@journeyapps-platform/micro-codecs';

export const Organization = t.object({
  name: t.string,
  locked: t.boolean.optional()
});
export type Organization = t.Encoded<typeof Organization>;

export const OrganizationResource = Resource.and(Organization);
export type OrganizationResource = t.Encoded<typeof OrganizationResource>;
