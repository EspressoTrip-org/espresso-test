import { CardinalVisibilityOption } from '../../../entities/AbstractCardinalEntity';
import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum KronosContextModelAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update'
}

export class KronosContextModel extends CardinalModelEntity<KronosContextModelAction> {
  constructor() {
    super({
      model: CardinalModel.KRONOS_CONTEXT,
      label: 'Kronos Context',
      description: 'A set of key-value pairs which are set as environment variables when executing a stack operation',
      visibility: CardinalVisibilityOption.PLATFORM,
      scope: CardinalScopeOption.UNSCOPED
    });

    this.addAction({
      action: KronosContextModelAction.UPDATE,
      label: 'Update',
      description: ''
    });

    this.addAction({
      action: KronosContextModelAction.READ,
      label: 'Read',
      description: ''
    });

    this.addAction({
      action: KronosContextModelAction.CREATE,
      label: 'Create',
      description: ''
    });
  }
}
