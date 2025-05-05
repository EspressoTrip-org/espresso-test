import { generateJSONSchema } from 'ts-codec';
import { Policy } from '@journeyapps-platform/types-cardinal';

export const CardinalSchema = Object.freeze(generateJSONSchema(Policy));
