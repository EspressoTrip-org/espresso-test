import { CardinalVisibilityOption } from '../../../entities/AbstractCardinalEntity';
import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum EmailModelAction {
  READ = 'read',
  SEND_EMAIL = 'send-email'
}

export class EmailModel extends CardinalModelEntity<EmailModelAction> {
  constructor() {
    super({
      model: CardinalModel.CUE_EMAIL,
      label: 'Email',
      description: 'An email message',
      scope: CardinalScopeOption.UNSCOPED,
      visibility: CardinalVisibilityOption.CUSTOMER_SUCCESS
    });

    this.addAction({
      action: EmailModelAction.READ,
      label: 'Read',
      description: 'Read recipient messages and message dates opened'
    });

    this.addAction({
      action: EmailModelAction.SEND_EMAIL,
      label: 'Send email',
      description: 'Send an email message'
    });
  }
}
