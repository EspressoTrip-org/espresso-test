import { CardinalModelEntity } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum WebContainerConfigModelAction {
  DELETE = 'delete',
  CREATE = 'create',
  READ = 'read'
}

export class WebContainerConfigModel extends CardinalModelEntity<WebContainerConfigModelAction> {
  constructor() {
    super({
      model: CardinalModel.WEB_CONTAINER_CONFIGURATION,
      label: 'Web Container Configuration',
      description: 'Web container configuration'
    });

    this.addAction({
      action: WebContainerConfigModelAction.READ,
      label: 'Read',
      description: 'Read web containers'
    });

    this.addAction({
      action: WebContainerConfigModelAction.CREATE,
      label: 'Create',
      description: 'Create web containers'
    });

    this.addAction({
      action: WebContainerConfigModelAction.DELETE,
      label: 'Delete',
      description: 'Delete web containers'
    });
  }
}
