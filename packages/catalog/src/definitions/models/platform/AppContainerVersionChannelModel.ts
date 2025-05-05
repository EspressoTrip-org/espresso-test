import { CardinalVisibilityOption } from '../../../entities/AbstractCardinalEntity';
import { CardinalModelEntity } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum AppContainerVersionChannelModelAction {
  READ = 'read'
}

export class AppContainerVersionChannelModel extends CardinalModelEntity<AppContainerVersionChannelModelAction> {
  constructor() {
    super({
      model: CardinalModel.APP_CONTAINER_CHANNEL,
      label: 'App Container Version Channel',
      description: 'Channels for development container versions',
      visibility: CardinalVisibilityOption.CUSTOMER_SUCCESS
    });

    this.addAction({
      action: AppContainerVersionChannelModelAction.READ,
      label: 'Read',
      description: 'List all channels'
    });
  }
}
