import * as micro from '@journeyapps-platform/micro';

export = micro.utils.collectEnvironmentVariables({
  MONGO_URI: micro.utils.type.string,
  MONGO_DATABASE: micro.utils.type.string,
  MONGO_USERNAME: micro.utils.type.string.optional(),
  MONGO_PASSWORD: micro.utils.type.string.optional()
});
