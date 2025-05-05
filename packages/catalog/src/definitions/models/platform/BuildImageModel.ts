import { CardinalVisibilityOption } from '../../../entities/AbstractCardinalEntity';
import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum BuildImageModelAction {
  CREATE = 'create',
  READ = 'read'
}

export class BuildImageModel extends CardinalModelEntity<BuildImageModelAction> {
  constructor() {
    super({
      model: CardinalModel.BUILD_IMAGE,
      label: 'Build Image',
      description: 'An image used for creating build containers',
      scope: CardinalScopeOption.UNSCOPED,
      visibility: CardinalVisibilityOption.PLATFORM
    });

    this.addAction({
      action: BuildImageModelAction.READ,
      label: 'Read',
      description: 'Read build image properties'
    });

    this.addAction({
      action: BuildImageModelAction.CREATE,
      label: 'Create',
      description: 'Create a new build image'
    });
  }
}
