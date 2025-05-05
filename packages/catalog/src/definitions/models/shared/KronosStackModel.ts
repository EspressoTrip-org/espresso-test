import { CardinalVisibilityOption } from '../../../entities/AbstractCardinalEntity';
import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum KronosStackModelAction {
  CREATE = 'create'
}

export class KronosStackModel extends CardinalModelEntity<KronosStackModelAction> {
  constructor() {
    super({
      model: CardinalModel.KRONOS_STACK,
      label: 'Kronos Stack',
      description: 'A resource that maps directly to a Pulumi Stack',
      visibility: CardinalVisibilityOption.PLATFORM,
      scope: CardinalScopeOption.UNSCOPED
    });

    this.addAction({
      action: KronosStackModelAction.CREATE,
      label: 'Create',
      description: 'Create a Kronos stack'
    });
  }
}
