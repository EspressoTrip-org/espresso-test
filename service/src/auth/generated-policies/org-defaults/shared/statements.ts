import * as cardinal from '@journeyapps-platform/types-cardinal';
import {
  CardinalModel,
  IntercomTicketAction,
  PowerSyncAlertRuleModelAction,
  PowerSyncInstanceModelAction,
  RailgunConfigurationModelAction,
  TokenModelAction
} from '@journeyapps-platform/cardinal-catalog';

export const createIntercomStatements = (org_id: string): cardinal.PolicyStatement[] => {
  return [
    {
      actions: [
        IntercomTicketAction.CREATE,
        IntercomTicketAction.READ,
        IntercomTicketAction.UPDATE,
        IntercomTicketAction.REPLY
      ],
      resources: [
        {
          scope: org_id,
          selector: {
            model: CardinalModel.INTERCOM_TICKET,
            id: '*'
          }
        }
      ]
    }
  ];
};

export const createRailgunStatements = (org_id: string): cardinal.PolicyStatement[] => {
  return [
    {
      actions: [
        RailgunConfigurationModelAction.CREATE,
        RailgunConfigurationModelAction.READ,
        RailgunConfigurationModelAction.DELETE,
        RailgunConfigurationModelAction.UPDATE,
        RailgunConfigurationModelAction.TEST,
        RailgunConfigurationModelAction.DELETE_INVOCATIONS,
        RailgunConfigurationModelAction.READ_INVOCATIONS
      ],
      resources: [
        {
          scope: org_id,
          selector: {
            model: CardinalModel.RAILGUN_CONFIGURATION,
            id: '*'
          }
        }
      ]
    }
  ];
};

export const createPowerSyncInstanceStatements = (org_id: string): cardinal.PolicyStatement[] => {
  return [
    {
      actions: [
        PowerSyncInstanceModelAction.CREATE,
        PowerSyncInstanceModelAction.READ,
        PowerSyncInstanceModelAction.DELETE,
        PowerSyncInstanceModelAction.UPDATE,
        PowerSyncInstanceModelAction.VIEW_LOGS
      ],
      resources: [
        {
          scope: org_id,
          selector: {
            model: CardinalModel.POWERSYNC_INSTANCE,
            id: '*'
          }
        }
      ]
    },
    {
      actions: [
        PowerSyncAlertRuleModelAction.CREATE,
        PowerSyncAlertRuleModelAction.READ,
        PowerSyncAlertRuleModelAction.DELETE,
        PowerSyncAlertRuleModelAction.UPDATE
      ],
      resources: [
        {
          scope: org_id,
          selector: {
            model: CardinalModel.POWERSYNC_ALERT_RULE,
            id: '*'
          }
        }
      ]
    }
  ];
};

export const createImplicitDraftAccessStatements = (org_id: string): cardinal.PolicyStatement[] => {
  return [
    {
      actions: ['*'],
      resources: [
        {
          scope: org_id,
          selector: {
            model: 'draft',
            id: '*',
            parents: [
              {
                model: 'user',
                id: '$actor.id'
              }
            ]
          }
        },
        {
          scope: org_id,
          selector: {
            model: 'draft',
            labels: {
              type: 'APP'
            }
          }
        }
      ]
    },
    {
      actions: ['read', 'write'],
      resources: [
        {
          scope: org_id,
          selector: {
            model: 'draft',
            labels: {
              type: 'USER',
              shared: 'true'
            }
          }
        }
      ]
    }
  ];
};

export const createAppContainerManagementAccessStatements = (org_id: string): cardinal.PolicyStatement[] => {
  return [
    {
      actions: ['write'],
      resources: [
        {
          scope: org_id,
          selector: {
            model: 'app-container:private-key',
            id: '*'
          }
        }
      ]
    },
    {
      actions: ['read'],
      resources: [
        {
          selector: {
            model: 'app-container:version',
            id: '*'
          }
        }
      ]
    },
    {
      actions: ['read', 'write', 'create', 'delete'],
      resources: [
        {
          scope: org_id,
          selector: {
            model: 'app-container:build',
            id: '*',
            parents: [
              {
                model: 'app-container:configuration',
                id: '*',
                parents: [
                  {
                    model: 'app',
                    id: '*'
                  }
                ]
              }
            ]
          }
        },
        {
          scope: org_id,
          selector: {
            model: 'app-container:configuration',
            id: '*',
            parents: [
              {
                model: 'app',
                id: '*'
              }
            ]
          }
        }
      ]
    }
  ];
};

export const build_container_executor: cardinal.PolicyStatement = {
  actions: ['read', 'execute'],
  resources: [
    {
      selector: {
        model: 'build-container',
        labels: {
          user_id: '$actor.id'
        }
      }
    }
  ]
};

export const createDeveloperInviteAccessStatements = (org_id: string): cardinal.PolicyStatement[] => {
  return [
    {
      actions: ['manage-developer-invitations'],
      resources: [
        {
          selector: {
            model: 'organization',
            id: org_id
          }
        }
      ]
    },

    {
      actions: ['read'],
      resources: [
        {
          scope: org_id,
          selector: {
            model: 'role',
            id: '*'
          }
        }
      ]
    },

    {
      actions: ['create', 'manage-org-role-assignments'],
      resources: [
        {
          scope: org_id,
          selector: {
            model: 'user',
            id: '*'
          }
        }
      ]
    }
  ];
};

/**
 * Developers are allowed to read their own PATs
 */
export const createDeveloperTokenAccessStatements = (org_id: string) => {
  return [
    {
      actions: [TokenModelAction.READ, TokenModelAction.CREATE, TokenModelAction.REVOKE],
      resources: [
        {
          scope: org_id,
          selector: {
            model: CardinalModel.TOKEN,
            labels: {
              user_id: '$actor.id'
            }
          }
        }
      ]
    }
  ];
};
