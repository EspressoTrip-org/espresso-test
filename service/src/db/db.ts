import { MongoDB } from '../system/mongo';
import env from './env';

export const createClient = () => {
  return new MongoDB({
    uri: env.MONGO_URI,
    database: env.MONGO_DATABASE,
    username: env.MONGO_USERNAME,
    password: env.MONGO_PASSWORD
  });
};
