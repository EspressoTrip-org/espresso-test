import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum IntegrationModelAction {
  ACQUIRE_TOKEN = 'acquire-token',
  CREATE = 'create',
  DELETE = 'delete',
  READ = 'read'
}

export class IntegrationModel extends CardinalModelEntity<IntegrationModelAction> {
  constructor() {
    super({
      model: CardinalModel.INTEGRATION,
      label: 'Integration',
      description: 'A 3rd party service integration'
    });

    this.addAction({
      action: IntegrationModelAction.CREATE,
      label: 'Create',
      description: 'Create a new integration'
    });

    this.addAction({
      action: IntegrationModelAction.DELETE,
      label: 'Delete',
      description: 'Remove an integration from an Organization'
    });

    this.addAction({
      action: IntegrationModelAction.READ,
      label: 'Read',
      description: 'Remove obfuscated integration properties'
    });

    this.addAction({
      action: IntegrationModelAction.ACQUIRE_TOKEN,
      label: 'Acquire Token',
      description: 'Read integration token'
    });
  }
}
