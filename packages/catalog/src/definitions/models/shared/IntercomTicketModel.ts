import { CardinalVisibilityOption } from '../../../entities/AbstractCardinalEntity';
import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum IntercomTicketAction {
  READ = 'read',
  UPDATE = 'update',
  CREATE = 'create',
  REPLY = 'reply'
}

export class IntercomTicketModel extends CardinalModelEntity<IntercomTicketAction> {
  constructor() {
    super({
      model: CardinalModel.INTERCOM_TICKET,
      label: 'Intercom Ticket',
      description: 'Support ticket',
      scope: CardinalScopeOption.SCOPED,
      visibility: CardinalVisibilityOption.PUBLIC
    });

    this.addAction({
      action: IntercomTicketAction.READ,
      label: 'Read',
      description: 'Read tickets and ticket replies.'
    });

    this.addAction({
      action: IntercomTicketAction.CREATE,
      label: 'Create ticket',
      description: 'Create a new support ticket.'
    });

    this.addAction({
      action: IntercomTicketAction.UPDATE,
      label: 'Update a ticket',
      description: 'Update ticket metadata.'
    });

    this.addAction({
      action: IntercomTicketAction.REPLY,
      label: 'Reply to ticket',
      description: 'Reply to a ticket.'
    });
  }
}
