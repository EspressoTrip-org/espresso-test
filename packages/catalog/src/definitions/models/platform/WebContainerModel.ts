import { CardinalVisibilityOption } from '../../../entities/AbstractCardinalEntity';
import { CardinalModelEntity } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum WebContainerModelAction {
  PROMOTE = 'promote',
  CREATE = 'create',
  READ = 'read'
}

export class WebContainerModel extends CardinalModelEntity<WebContainerModelAction> {
  constructor() {
    super({
      model: CardinalModel.WEB_CONTAINER_CONFIGURATION,
      label: 'Web Container',
      description: 'A master web container version'
    });

    this.addAction({
      action: WebContainerModelAction.READ,
      label: 'Read',
      description: 'Read web container versions'
    });

    this.addAction({
      action: WebContainerModelAction.CREATE,
      label: 'Create',
      visibility: CardinalVisibilityOption.PLATFORM,
      description: 'Create web container versions'
    });

    this.addAction({
      action: WebContainerModelAction.PROMOTE,
      label: 'Promote',
      visibility: CardinalVisibilityOption.PLATFORM,
      description: 'Promote beta container versions to production'
    });
  }
}
