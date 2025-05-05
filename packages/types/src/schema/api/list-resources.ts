import * as t from 'ts-codec';
import { FilterProperties } from '@journeyapps-platform/micro-codecs';

export const V2ListResourceParams = FilterProperties(
  t.object({ id: t.string, org_id: t.string, user_id: t.string })
).and(
  t.object({
    cursor: t.string.optional(),
    limit: t.number.optional()
  })
);

export type V2ListResourceParams = t.Encoded<typeof V2ListResourceParams>;
