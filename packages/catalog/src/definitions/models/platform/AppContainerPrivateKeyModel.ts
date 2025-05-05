import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum AppContainerPrivateKeyModelAction {
  WRITE = 'write'
}

export class AppContainerPrivateKeyModel extends CardinalModelEntity<AppContainerPrivateKeyModelAction> {
  constructor() {
    super({
      model: CardinalModel.APP_CONTAINER_PRIVATE_KEY,
      label: 'App Container Private Key',
      description: 'A container private key for iOS signing'
    });

    this.addAction({
      action: AppContainerPrivateKeyModelAction.WRITE,
      label: 'Write',
      description: 'Create a new private key'
    });

    this.addParent(CardinalModel.ORG);
  }
}
