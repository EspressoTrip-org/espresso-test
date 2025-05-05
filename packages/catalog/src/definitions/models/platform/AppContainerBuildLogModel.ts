import { CardinalVisibilityOption } from '../../../entities/AbstractCardinalEntity';
import { CardinalModelEntity } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum AppContainerBuildLogModelAction {
  READ = 'read'
}

export class AppContainerBuildLogModel extends CardinalModelEntity<AppContainerBuildLogModelAction> {
  constructor() {
    super({
      model: CardinalModel.APP_CONTAINER_BUILD_LOG,
      label: 'App Container Build Log',
      description: 'Container branded build job log',
      visibility: CardinalVisibilityOption.CUSTOMER_SUCCESS
    });

    this.addAction({
      action: AppContainerBuildLogModelAction.READ,
      label: 'Read',
      description: 'Read build logs'
    });

    this.addParent(CardinalModel.APP_CONTAINER_CONFIGURATION);
  }
}
