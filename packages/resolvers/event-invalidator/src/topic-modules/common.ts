import * as resources from './resource-operation-events';
import * as sso from './sso-config';
import * as drafts from './drafts';

export const common_topic_modules = [
  resources.resource_operation_events_module,
  drafts.draft_events_module,
  sso.sso_config_module
];
