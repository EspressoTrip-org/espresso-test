import { CardinalVisibilityOption } from '../../../entities/AbstractCardinalEntity';
import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum LokiKeyModelAction {
  CREATE = 'create',
  DELETE = 'delete',
  READ = 'read',
  UPDATE = 'update'
}

export class LokiKeyModel extends CardinalModelEntity<LokiKeyModelAction> {
  constructor() {
    super({
      model: CardinalModel.LOKI_KEY,
      label: 'Loki Key',
      description: 'An encryption key',
      visibility: CardinalVisibilityOption.PLATFORM,
      scope: CardinalScopeOption.UNSCOPED
    });

    this.addAction({
      action: LokiKeyModelAction.READ,
      label: 'Read',
      description: 'Read key and key pairs'
    });

    this.addAction({
      action: LokiKeyModelAction.UPDATE,
      label: 'Update',
      description: 'Update key name or labels'
    });

    this.addAction({
      action: LokiKeyModelAction.DELETE,
      label: 'Delete',
      description: 'Delete key and key pairs'
    });
  }
}
