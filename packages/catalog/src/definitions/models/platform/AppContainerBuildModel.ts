import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum AppContainerBuildModelAction {
  CREATE = 'create',
  DELETE = 'delete',
  READ = 'read',
  WRITE = 'write'
}

export class AppContainerBuildModel extends CardinalModelEntity<AppContainerBuildModelAction> {
  constructor() {
    super({
      model: CardinalModel.APP_CONTAINER_BUILD,
      label: 'App Container Build',
      description: 'Container branded build'
    });

    this.addAction({
      action: AppContainerBuildModelAction.READ,
      label: 'Read',
      description: 'Read build status'
    });

    this.addAction({
      action: AppContainerBuildModelAction.WRITE,
      label: 'Write',
      description: 'Update build status'
    });

    this.addAction({
      action: AppContainerBuildModelAction.CREATE,
      label: 'Create',
      description: 'Trigger branded build compilation'
    });

    this.addAction({
      action: AppContainerBuildModelAction.DELETE,
      label: 'Delete',
      description: 'Delete a branded build'
    });

    this.addParent(CardinalModel.APP_CONTAINER_CONFIGURATION);
  }
}
