import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum PolicyModelAction {
  CREATE = 'create',
  DELETE = 'delete',
  READ = 'read',
  UPDATE = 'update'
}

export class PolicyModel extends CardinalModelEntity<PolicyModelAction> {
  constructor() {
    super({
      model: CardinalModel.POLICY,
      label: 'Policy',
      description: 'A Cardinal permissions policy',
      scope: CardinalScopeOption.BOTH
    });

    this.addAction({
      action: PolicyModelAction.READ,
      label: 'Read',
      description: 'Read policy statements'
    });

    this.addAction({
      action: PolicyModelAction.CREATE,
      label: 'Create',
      description: 'Create a new policy'
    });

    this.addAction({
      action: PolicyModelAction.DELETE,
      label: 'Delete',
      description: 'Delete a policy'
    });

    this.addAction({
      action: PolicyModelAction.UPDATE,
      label: 'Update',
      description: 'Update policy statements'
    });
  }
}
