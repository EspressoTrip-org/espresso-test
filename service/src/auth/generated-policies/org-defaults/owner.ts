import * as cardinal from '@journeyapps-platform/types-cardinal';
import {
  build_container_executor,
  createAppContainerManagementAccessStatements,
  createDeveloperInviteAccessStatements,
  createDeveloperTokenAccessStatements,
  createImplicitDraftAccessStatements,
  createIntercomStatements,
  createPowerSyncInstanceStatements,
  createRailgunStatements
} from './shared/statements';
import { MANAGED_POLICY } from './shared/utils';
import {
  CardinalModel,
  IntegrationModelAction,
  OrganizationModelAction,
  PlanModelAction
} from '@journeyapps-platform/cardinal-catalog';

export const createOwnerPolicy = (org_id: string): cardinal.Policy => {
  return {
    name: MANAGED_POLICY.OWNER,
    description: 'The holder of this policy can perform all operations within an organization',
    org_id: org_id,
    statements: [
      {
        actions: [OrganizationModelAction.UPDATE_BILLING, OrganizationModelAction.UPDATE],
        resources: [
          {
            selector: {
              model: CardinalModel.ORG,
              id: org_id
            }
          }
        ]
      },
      /**
       * Owners can read their plans
       */
      {
        actions: [PlanModelAction.READ, PlanModelAction.UPGRADE, PlanModelAction.DOWNGRADE],
        resources: [
          {
            scope: org_id,
            selector: {
              model: CardinalModel.PLAN,
              id: '*'
            }
          }
        ]
      },
      /**
       * Owners can manage integrations
       */
      {
        actions: [
          IntegrationModelAction.CREATE,
          IntegrationModelAction.READ,
          IntegrationModelAction.DELETE,
          IntegrationModelAction.ACQUIRE_TOKEN
        ],
        resources: [
          {
            scope: org_id,
            selector: {
              model: CardinalModel.INTEGRATION,
              id: '*'
            }
          }
        ]
      },

      // Allow them to read their organization
      {
        actions: ['read'],
        resources: [
          {
            selector: {
              model: 'organization',
              id: org_id
            }
          }
        ]
      },

      ...createDeveloperTokenAccessStatements(org_id),
      ...createDeveloperInviteAccessStatements(org_id),

      {
        actions: ['read'],
        resources: [
          {
            scope: org_id,
            selector: {
              model: 'policy',
              id: '*'
            }
          }
        ]
      },

      {
        actions: ['read', 'info', 'create', 'update', 'delete'],
        resources: [
          {
            scope: org_id,
            selector: {
              model: 'sso-config',
              id: '*'
            }
          }
        ]
      },

      {
        actions: ['read', 'write', 'create', 'delete', 'update'],
        resources: [
          {
            scope: org_id,
            selector: {
              model: 'app',
              id: '*'
            }
          },
          {
            scope: org_id,
            selector: {
              model: 'user',
              id: '*'
            }
          },
          {
            scope: org_id,
            selector: {
              model: 'deployment',
              id: '*'
            }
          }
        ]
      },

      {
        actions: ['deploy', 'info', 'provision', 'deprovision'],
        resources: [
          {
            scope: org_id,
            selector: {
              model: 'deployment',
              id: '*'
            }
          }
        ]
      },

      {
        actions: [
          'read',
          'update',
          'delete',
          'elevate',
          'create:objects',
          'read:objects',
          'update:objects',
          'delete:objects',
          'create:app-users',
          'read:app-users',
          'update:app-users',
          'delete:app-users',
          'create:web-users',
          'read:web-users',
          'update:web-users',
          'remove:web-users',
          'manage:grants',
          'manage:api',
          'manage:indexes',
          'manage:webhooks',
          'read:audit-logs',
          'read:sync-diagnostics',
          'read:diagnostic-reports',
          'read:diagnostics'
        ],
        resources: [
          {
            scope: org_id,
            selector: {
              model: 'deployment',
              id: '*'
            }
          }
        ]
      },

      ...createPowerSyncInstanceStatements(org_id),

      build_container_executor,
      ...createImplicitDraftAccessStatements(org_id),
      ...createAppContainerManagementAccessStatements(org_id),
      ...createRailgunStatements(org_id),
      ...createIntercomStatements(org_id)
    ]
  };
};
