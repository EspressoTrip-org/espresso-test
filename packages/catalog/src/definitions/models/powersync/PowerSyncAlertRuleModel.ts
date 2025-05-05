import { CardinalModelEntity } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum PowerSyncAlertRuleModelAction {
  READ = 'read',
  CREATE = 'create',
  DELETE = 'delete',
  UPDATE = 'update'
}

export class PowerSyncAlertRuleModel extends CardinalModelEntity<PowerSyncAlertRuleModelAction> {
  constructor() {
    super({
      model: CardinalModel.POWERSYNC_ALERT_RULE,
      label: 'PowerSync Alert Rule',
      description: 'Represents various alerting rules (metric and issues) for a PowerSync instance'
    });

    this.addAction({
      action: PowerSyncAlertRuleModelAction.READ,
      label: 'Read',
      description: 'Read a PowerSync Alert Rule'
    });

    this.addAction({
      action: PowerSyncAlertRuleModelAction.CREATE,
      label: 'Create',
      description: 'Create a PowerSync Alert Rule (of any sub-type)'
    });

    this.addAction({
      action: PowerSyncAlertRuleModelAction.DELETE,
      label: 'Delete',
      description: 'Read a PowerSync Alert Rule'
    });

    this.addAction({
      action: PowerSyncAlertRuleModelAction.UPDATE,
      label: 'Update',
      description: 'Update a PowerSync Alert Rule'
    });

    this.addParent(CardinalModel.POWERSYNC_INSTANCE);
  }
}
