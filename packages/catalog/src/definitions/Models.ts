export enum CardinalModel {
  // Shared entities
  APP = 'app',
  CONTAINER_DEPOT_TOKEN = 'container-depot-token',
  CUE_EMAIL = 'cue:email',
  CUE_TRACKED_LINK = 'cue:tracked-link',
  INTEGRATION = 'integration',
  INTERCOM_TICKET = 'intercom:ticket',
  KRONOS_CONTEXT = 'kronos:context',
  KRONOS_PROGRAM = 'kronos:program',
  KRONOS_STACK = 'kronos:stack',
  KRONOS_STACK_OPERATION = 'kronos:stack-operation',
  LOKI_KEY = 'loki:key',
  ORG = 'organization',
  PLAN = 'plan',
  PLAN_BLUEPRINT = 'plan-blueprint',
  POLICY = 'policy',
  RAILGUN_CONFIGURATION = 'railgun:configuration',
  ROLE = 'role',
  TOKEN = 'token',
  USER = 'user',

  // PowerSync entities
  POWERSYNC_INSTANCE = 'powersync-instance',
  POWERSYNC_ALERT_RULE = 'powersync-alerts:rule',

  // Platform entities
  APP_CONTAINER_BUILD = 'app-container:build',
  APP_CONTAINER_BUILD_LOG = 'app-container:build-log',
  APP_CONTAINER_CHANNEL = 'app-container:channel',
  APP_CONTAINER_CONFIGURATION = 'app-container:configuration',
  APP_CONTAINER_PRIVATE_KEY = 'app-container:private-key',
  APP_CONTAINER_VERSION = 'app-container:version',
  BUILD_CONTAINER = 'build-container',
  BUILD_IMAGE = 'build-image',
  DASHBOARD = 'dashboard',
  DEPLOYMENT = 'deployment',
  DRAFT = 'draft',
  OPSQL_PIPELINE = 'opsql:pipeline',
  OPSQL_USER = 'opsql:user',
  SSO_CONFIG = 'sso-config',
  WEB_CONTAINER = 'web-container',
  WEB_CONTAINER_CONFIGURATION = 'web-configuration'
}
