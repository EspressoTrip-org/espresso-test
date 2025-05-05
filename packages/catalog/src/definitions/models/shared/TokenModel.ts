import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum TokenModelAction {
  CREATE = 'create',
  UPDATE = 'update',
  READ = 'read',
  REVOKE = 'revoke'
}

export class TokenModel extends CardinalModelEntity<TokenModelAction> {
  constructor() {
    super({
      model: CardinalModel.TOKEN,
      label: 'Token',
      description: 'A Cardinal token which represents an actor',
      scope: CardinalScopeOption.BOTH
    });

    this.addAction({
      action: TokenModelAction.CREATE,
      label: 'Create',
      description: 'Create a new token with no policies attached'
    });

    this.addAction({
      action: TokenModelAction.UPDATE,
      label: 'Update',
      description: 'Update token description and policy assignments'
    });

    this.addAction({
      action: TokenModelAction.READ,
      label: 'Read',
      description: 'Read token description and policy assignments'
    });

    this.addAction({
      action: TokenModelAction.REVOKE,
      label: 'Revoke',
      description: 'Revoke a token rendering it inoperable.'
    });
  }
}
