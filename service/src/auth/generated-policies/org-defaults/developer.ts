import * as cardinal from '@journeyapps-platform/types-cardinal';
import {
  build_container_executor,
  createAppContainerManagementAccessStatements,
  createImplicitDraftAccessStatements,
  createDeveloperTokenAccessStatements,
  createPowerSyncInstanceStatements,
  createRailgunStatements,
  createIntercomStatements
} from './shared/statements';
import { MANAGED_POLICY } from './shared/utils';

export const createDeveloperPolicy = (org_id: string): cardinal.Policy => {
  return {
    name: MANAGED_POLICY.DEVELOPER,
    description: 'Perform operations necessary for developing on an app',
    org_id: org_id,
    statements: [
      {
        actions: ['read'],
        resources: [
          {
            selector: {
              model: 'organization',
              id: org_id
            }
          },
          {
            scope: org_id,
            selector: {
              model: 'user',
              id: '*'
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
        actions: ['read', 'write', 'create'],
        resources: [
          {
            scope: org_id,
            selector: {
              model: 'app',
              id: '*'
            }
          }
        ]
      },

      {
        actions: ['read', 'create'],
        resources: [
          {
            scope: org_id,
            selector: {
              model: 'integration',
              id: '*'
            }
          }
        ]
      },

      {
        actions: ['read', 'create', 'deploy', 'update'],
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
          'elevate',
          'create:objects',
          'read:objects',
          'update:objects',
          'delete:objects',
          'create:app-users',
          'read:app-users',
          'update:app-users',
          'delete:app-users',
          'read:web-users',
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
      ...createDeveloperTokenAccessStatements(org_id),
      ...createRailgunStatements(org_id),
      ...createIntercomStatements(org_id)
    ]
  };
};
