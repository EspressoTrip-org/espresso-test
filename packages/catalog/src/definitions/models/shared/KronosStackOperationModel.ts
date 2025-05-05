import { CardinalVisibilityOption } from '../../../entities/AbstractCardinalEntity';
import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum KronosStackOperationModelAction {
  CREATE = 'create',
  READ = 'read'
}

export class KronosStackOperationModel extends CardinalModelEntity<KronosStackOperationModelAction> {
  constructor() {
    super({
      model: CardinalModel.KRONOS_STACK_OPERATION,
      label: 'Kronos Stack Operation',
      description: 'Simple datum which represents a request for execution of a stack',
      visibility: CardinalVisibilityOption.PLATFORM,
      scope: CardinalScopeOption.UNSCOPED
    });

    this.addAction({
      action: KronosStackOperationModelAction.CREATE,
      label: 'Create',
      description: 'Create a Kronos program'
    });

    this.addAction({
      action: KronosStackOperationModelAction.READ,
      label: 'READ',
      description: 'Create a Kronos program'
    });
  }
}
