import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum OrganizationModelAction {
  CREATE = 'create',
  MANAGE_DEVELOPER_INVITATIONS = 'manage-developer-invitations',
  READ = 'read',
  UPDATE = 'update',
  UPDATE_BILLING = 'update-billing',
  UPDATE_LOCKS = 'update-locks',
  USER_APP_METRICS = 'user-app-metrics'
}

export class OrganizationModel extends CardinalModelEntity<OrganizationModelAction> {
  constructor() {
    super({
      model: CardinalModel.ORG,
      label: 'Organization',
      description: 'The top level domain object which represents the scope',
      scope: CardinalScopeOption.UNSCOPED // Org is the scope
    });

    this.addAction({
      action: OrganizationModelAction.READ,
      label: 'Read',
      description: 'Read an organization'
    });

    this.addAction({
      action: OrganizationModelAction.CREATE,
      label: 'Create',
      description: 'Create a new organization'
    });

    this.addAction({
      action: OrganizationModelAction.UPDATE,
      label: 'Update',
      description: 'Update an organization'
    });

    this.addAction({
      action: OrganizationModelAction.UPDATE_BILLING,
      label: 'Update Billing',
      description: "Update an organization's billing information associated with plans."
    });

    this.addAction({
      action: OrganizationModelAction.UPDATE_LOCKS,
      label: 'Update Locks',
      description: "Update an organization's locks including locking/unlocking the organization itself."
    });

    this.addAction({
      action: OrganizationModelAction.MANAGE_DEVELOPER_INVITATIONS,
      label: 'Manage developer invitations',
      description: 'Manage developer invitations for an organization'
    });

    this.addAction({
      action: OrganizationModelAction.USER_APP_METRICS,
      label: 'Read user app metrics',
      description: 'Read user app metrics for an organization'
    });
  }
}
