import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum ContainerDepotTokenModelAction {
  CREATE = 'create',
  READ = 'read',
  REVOKE = 'revoke'
}

export class ContainerDepotTokenModel extends CardinalModelEntity<ContainerDepotTokenModelAction> {
  constructor() {
    super({
      model: CardinalModel.CONTAINER_DEPOT_TOKEN,
      label: 'Container Depot Token',
      description: 'A token which grants pull access to the shared container registry.',
      scope: CardinalScopeOption.SCOPED
    });

    this.addAction({
      action: ContainerDepotTokenModelAction.CREATE,
      label: 'Create',
      description: 'Create a new token and return the secret'
    });

    this.addAction({
      action: ContainerDepotTokenModelAction.READ,
      label: 'Read',
      description: 'Read token metadata'
    });

    this.addAction({
      action: ContainerDepotTokenModelAction.REVOKE,
      label: 'Revoke',
      description: 'Revoke a token rendering it inoperable.'
    });
  }
}
