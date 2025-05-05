import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum AppContainerConfigModelAction {
  CREATE = 'create',
  DELETE = 'delete',
  READ = 'read',
  WRITE = 'write'
}

export class AppContainerConfigModel extends CardinalModelEntity<AppContainerConfigModelAction> {
  constructor() {
    super({
      model: CardinalModel.APP_CONTAINER_CONFIGURATION,
      label: 'App Container Configuration',
      description: 'A container configuration for multiple platforms'
    });

    this.addAction({
      action: AppContainerConfigModelAction.READ,
      label: 'Read',
      description: 'Read container configuration'
    });

    this.addAction({
      action: AppContainerConfigModelAction.WRITE,
      label: 'Write',
      description: 'Update container features and settings'
    });

    this.addAction({
      action: AppContainerConfigModelAction.CREATE,
      label: 'Create',
      description: 'Create new container configuration'
    });

    this.addAction({
      action: AppContainerConfigModelAction.DELETE,
      label: 'Delete',
      description: 'Delete container configuration'
    });

    this.addParent(CardinalModel.APP);
  }
}
