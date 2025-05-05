import { CardinalVisibilityOption } from '../../../entities/AbstractCardinalEntity';
import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum KronosProgramModelAction {
  CREATE = 'create'
}

export class KronosProgramModel extends CardinalModelEntity<KronosProgramModelAction> {
  constructor() {
    super({
      model: CardinalModel.KRONOS_PROGRAM,
      label: 'Kronos Program',
      description:
        'Immutable named and versioned datum that represents an npm package and a schema which should be JSON-Schema',
      visibility: CardinalVisibilityOption.PLATFORM,
      scope: CardinalScopeOption.UNSCOPED
    });

    this.addAction({
      action: KronosProgramModelAction.CREATE,
      label: 'Create',
      description: 'Create a Kronos program'
    });
  }
}
