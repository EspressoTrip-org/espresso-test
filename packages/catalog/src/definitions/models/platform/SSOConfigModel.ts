import { CardinalModelEntity } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum SSOConfigModelAction {
  CREATE = 'create',
  DELETE = 'delete',
  INFO = 'info',
  READ = 'read',
  UPDATE = 'update'
}

export class SSOConfigModel extends CardinalModelEntity<SSOConfigModelAction> {
  constructor() {
    super({
      model: CardinalModel.SSO_CONFIG,
      label: 'SSO Config',
      description: 'An enrolment SSO configuration'
    });

    this.addAction({
      action: SSOConfigModelAction.READ,
      label: 'Read list',
      description: 'List SSO configurations for auth scope'
    });

    this.addAction({
      action: SSOConfigModelAction.CREATE,
      label: 'Create',
      description: 'Create a SSO configuration'
    });

    this.addAction({
      action: SSOConfigModelAction.DELETE,
      label: 'Delete',
      description: 'Delete a SSO configuration'
    });

    this.addAction({
      action: SSOConfigModelAction.UPDATE,
      label: 'Update',
      description: 'Update a SSO configuration'
    });

    this.addAction({
      action: SSOConfigModelAction.INFO,
      label: 'Read',
      description: 'Read specific SSO configuration from Org and ID'
    });
  }
}
