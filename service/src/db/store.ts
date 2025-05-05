import * as micro_migrate from '@journeyapps-platform/micro-migrate';
import env from './env';

export = micro_migrate.createMongoMigrationStore({
  uri: env.MONGO_URI,
  database: env.MONGO_DATABASE,
  username: env.MONGO_USERNAME,
  password: env.MONGO_PASSWORD
});
