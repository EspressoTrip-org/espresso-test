import { CardinalVisibilityOption } from '../../../entities/AbstractCardinalEntity';
import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum CueTrackedLinkModelAction {
  READ = 'read'
}

export class CueTrackedLinkModel extends CardinalModelEntity<CueTrackedLinkModelAction> {
  constructor() {
    super({
      model: CardinalModel.CUE_TRACKED_LINK,
      label: 'Tracked Email Link',
      description: 'An email message tracked link',
      scope: CardinalScopeOption.UNSCOPED,
      visibility: CardinalVisibilityOption.CUSTOMER_SUCCESS
    });

    this.addAction({
      action: CueTrackedLinkModelAction.READ,
      label: 'Read',
      description: 'Read email link with dates opened'
    });

    this.addLabel({
      name: CardinalModel.CUE_EMAIL,
      label: 'Email',
      description: 'The email message that the link belongs to'
    });
  }
}
