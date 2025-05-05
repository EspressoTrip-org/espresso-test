import * as micro from '@journeyapps-platform/micro';

const t = micro.utils.type;

export const env = micro.utils.collectEnvironmentVariables({
  PORT: t.number.default('7777'),
  NODE_ENV: t.string.default('development'),
  SHA: t.string.default('unknown'),
  MOCK: t.list.default(''),

  KAFKA_BROKERS: t.list,
  KAFKA_USERNAME: t.string.optional(),
  KAFKA_PASSWORD: t.string.optional(),
  KAFKA_MECHANISM: t.string.default('SCRAM-SHA-512'),

  MONGO_URI: t.string,
  MONGO_DATABASE: t.string,
  MONGO_USERNAME: t.string.optional(),
  MONGO_PASSWORD: t.string.optional(),

  ACCOUNTS_CLIENT_ID: t.string,
  ACCOUNTS_CLIENT_SECRET: t.string,

  JWT_ISSUER: t.string
});

export default env;
