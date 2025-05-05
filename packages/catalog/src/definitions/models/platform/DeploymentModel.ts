import { CardinalModelEntity } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export const DeploymentModelAction = {
  CREATE: 'create',
  DELETE: 'delete',
  INFO: 'info',
  READ: 'read',
  DEPLOY: 'deploy',
  UPDATE: 'update'
} as const;
export type DeploymentModelAction = typeof DeploymentModelAction[keyof typeof DeploymentModelAction];

export const DeploymentProvisioningAction = {
  PROVISION: 'provision',
  DEPROVISION: 'deprovision'
} as const;
export type DeploymentProvisioningAction =
  typeof DeploymentProvisioningAction[keyof typeof DeploymentProvisioningAction];

export const DeploymentBackEndModelAction = {
  UPLOAD_DIAGNOSTICS: 'upload:diagnostics',
  CREATE_APP_USERS: 'create:app-users',
  CREATE_OBJECTS: 'create:objects',
  CREATE_WEB_USERS: 'create:web-users',
  DELETE_APP_USERS: 'delete:app-users',
  DELETE_OBJECTS: 'delete:objects',
  ELEVATE: 'elevate',
  MANAGE_API: 'manage:api',
  MANAGE_GRANTS: 'manage:grants',
  MANAGE_INDEXES: 'manage:indexes',
  MANAGE_WEBHOOKS: 'manage:webhooks',
  READ_APP_USERS: 'read:app-users',
  READ_AUDIT_LOGS: 'read:audit-logs',
  READ_DIAGNOSTICS: 'read:diagnostics',
  READ_DIAGNOSTICS_REPORTS: 'read:diagnostic-reports',
  READ_OBJECTS: 'read:objects',
  READ_SYNC_DIAGNOSTICS: 'read:sync-diagnostics',
  READ_WEB_USERS: 'read:web-users',
  REMOVE_WEB_USERS: 'remove:web-users',
  UPDATE_APP_USERS: 'update:app-users',
  UPDATE_OBJECTS: 'update:objects',
  UPDATE_WEB_USERS: 'update:web-users'
} as const;
export type DeploymentBackEndModelAction =
  typeof DeploymentBackEndModelAction[keyof typeof DeploymentBackEndModelAction];

export const DeploymentAction = {
  ...DeploymentModelAction,
  ...DeploymentProvisioningAction,
  ...DeploymentBackEndModelAction
} as const;
export type DeploymentAction = typeof DeploymentAction[keyof typeof DeploymentAction];

export class DeploymentModel extends CardinalModelEntity<typeof DeploymentAction> {
  constructor() {
    super({
      model: CardinalModel.DEPLOYMENT,
      label: 'Deployment',
      description: 'A JourneyApps Application deployment'
    });

    // Deployment model actions
    this.addAction({
      action: DeploymentModelAction.READ,
      label: 'Read',
      description: 'Read deployment properties, users, dashboards and Data-model'
    });

    this.addAction({
      action: DeploymentModelAction.CREATE,
      label: 'Create',
      description: 'Create a new deployment'
    });

    this.addAction({
      action: DeploymentModelAction.DELETE,
      label: 'Delete',
      description: 'Delete a deployment'
    });

    this.addAction({
      action: DeploymentModelAction.UPDATE,
      label: 'Update',
      description: 'Update a deployment'
    });

    this.addAction({
      action: DeploymentModelAction.INFO,
      label: 'Info',
      description: 'Read metrics and other info about a deployment'
    });

    this.addAction({
      action: DeploymentModelAction.DEPLOY,
      label: 'Deploy',
      description: 'Deploy updates to a deployment'
    });

    // Deployment provisioning actions
    this.addAction({
      action: DeploymentProvisioningAction.PROVISION,
      label: 'Provision',
      description: 'Provision a user for deployment'
    });

    this.addAction({
      action: DeploymentProvisioningAction.DEPROVISION,
      label: 'Deprovision',
      description: 'Deprovision/lock a user from a deployment'
    });

    // Deployment back-end actions
    this.addAction({
      action: DeploymentBackEndModelAction.UPLOAD_DIAGNOSTICS,
      label: 'Upload Diagnostics',
      description: 'Update diagnostics reports'
    });

    this.addAction({
      action: DeploymentBackEndModelAction.READ_DIAGNOSTICS,
      label: 'Read Diagnostics',
      description: 'Read diagnostics'
    });

    this.addAction({
      action: DeploymentBackEndModelAction.ELEVATE,
      label: 'Elevate permissions',
      description: 'Elevate permission to access audit logs and other sensitive data'
    });

    this.addAction({
      action: DeploymentBackEndModelAction.CREATE_OBJECTS,
      label: 'Create objects',
      description: 'Create new objects in the backend'
    });

    this.addAction({
      action: DeploymentBackEndModelAction.READ_OBJECTS,
      label: 'Read objects',
      description: 'Read objects in the backend'
    });

    this.addAction({
      action: DeploymentBackEndModelAction.CREATE_APP_USERS,
      label: 'Create app users',
      description: 'Create new app users in the backend'
    });

    this.addAction({
      action: DeploymentBackEndModelAction.READ_APP_USERS,
      label: 'Read app users',
      description: 'Read app users in the backend'
    });

    this.addAction({
      action: DeploymentBackEndModelAction.UPDATE_APP_USERS,
      label: 'Update app users',
      description: 'Update app users in the backend'
    });

    this.addAction({
      action: DeploymentBackEndModelAction.DELETE_APP_USERS,
      label: 'Delete app users',
      description: 'Delete app users in the backend'
    });

    this.addAction({
      action: DeploymentBackEndModelAction.CREATE_WEB_USERS,
      label: 'Create web users',
      description: 'Create web users in the backend',
      deprecated: true
    });

    this.addAction({
      action: DeploymentBackEndModelAction.READ_WEB_USERS,
      label: 'Read web users',
      description: 'Read web users in the backend',
      deprecated: true
    });

    this.addAction({
      action: DeploymentBackEndModelAction.UPDATE_WEB_USERS,
      label: 'Update web users',
      description: 'Update web users in the backend',
      deprecated: true
    });

    this.addAction({
      action: DeploymentBackEndModelAction.REMOVE_WEB_USERS,
      label: 'Remove web users',
      description: 'Remove web users in the backend',
      deprecated: true
    });

    this.addAction({
      action: DeploymentBackEndModelAction.MANAGE_GRANTS,
      description: 'Manage backend grants for data-browser',
      label: 'Manage backend grants',
      deprecated: true
    });

    this.addAction({
      action: DeploymentBackEndModelAction.MANAGE_API,
      label: 'Manage backend API',
      description: 'Manage backend API credentials'
    });

    this.addAction({
      action: DeploymentBackEndModelAction.MANAGE_INDEXES,
      label: 'Manage backend indexes',
      description: 'CRUD backend indexes'
    });

    this.addAction({
      action: DeploymentBackEndModelAction.MANAGE_WEBHOOKS,
      label: 'Manage backend webhooks',
      description: 'Manage backend webhooks'
    });

    this.addAction({
      action: DeploymentBackEndModelAction.READ_AUDIT_LOGS,
      label: 'Read audit logs',
      description: 'Read backend audit logs'
    });

    this.addAction({
      action: DeploymentBackEndModelAction.READ_SYNC_DIAGNOSTICS,
      label: 'Read sync diagnostics',
      description: 'Read backend sync diagnostics'
    });

    this.addAction({
      action: DeploymentBackEndModelAction.READ_DIAGNOSTICS_REPORTS,
      label: 'Read diagnostics reports',
      description: 'Read backend diagnostics reports'
    });

    this.addAction({
      action: DeploymentBackEndModelAction.UPDATE_OBJECTS,
      label: 'Update objects',
      description: 'Update backend objects'
    });
    this.addAction({
      action: DeploymentBackEndModelAction.DELETE_OBJECTS,
      label: 'Delete objects',
      description: 'Delete backend objects'
    });

    this.addParent(CardinalModel.APP);
  }
}
