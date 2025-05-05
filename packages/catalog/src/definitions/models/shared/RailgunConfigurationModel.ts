import { CardinalModel } from '../../Models';
import { CardinalModelEntity } from '../../../entities/CardinalModelEntity';

export enum RailgunConfigurationModelAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
  READ_INVOCATIONS = 'read-invocations',
  DELETE_INVOCATIONS = 'delete-invocations',
  TEST = 'test'
}

export class RailgunConfigurationModel extends CardinalModelEntity<RailgunConfigurationModelAction> {
  constructor() {
    super({
      model: CardinalModel.RAILGUN_CONFIGURATION,
      label: 'Railgun configuration',
      description: 'A configuration and set of rules that notifies on events (webhook, email, etc..).'
    });

    this.addAction({
      action: RailgunConfigurationModelAction.CREATE,
      label: 'Create',
      description: 'Create new configurations.'
    });

    this.addAction({
      action: RailgunConfigurationModelAction.DELETE,
      label: 'Delete',
      description: 'Delete configurations (and associated invocation entries).'
    });

    this.addAction({
      action: RailgunConfigurationModelAction.UPDATE,
      label: 'Update',
      description: 'Update the configuration (includes pausing and resuming).'
    });

    this.addAction({
      action: RailgunConfigurationModelAction.READ,
      label: 'Read',
      description: 'View the configuration and its underlying rules.'
    });

    this.addAction({
      action: RailgunConfigurationModelAction.TEST,
      label: 'Test',
      description: 'Send a test payload/notification based on the underlying configuration rules.'
    });

    this.addAction({
      action: RailgunConfigurationModelAction.READ_INVOCATIONS,
      label: 'Read invocations',
      description: 'Read invocations created by this configuration.'
    });

    this.addAction({
      action: RailgunConfigurationModelAction.DELETE_INVOCATIONS,
      label: 'Read invocations',
      description: 'Delete any completed or pending invocations created by this configuration.'
    });

    this.addParent(CardinalModel.APP);
  }
}
