import { CardinalVisibilityOption } from '../../../entities/AbstractCardinalEntity';
import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum AppContainerVersionModelAction {
  PROMOTE = 'promote',
  READ = 'read',
  WRITE = 'write'
}

export class AppContainerVersionModel extends CardinalModelEntity<AppContainerVersionModelAction> {
  constructor() {
    super({
      model: CardinalModel.APP_CONTAINER_VERSION,
      label: 'Container Version',
      description: 'Container version blueprint',
      scope: CardinalScopeOption.UNSCOPED
    });

    this.addAction({
      action: AppContainerVersionModelAction.READ,
      label: 'Read',
      description: 'Read container versions'
    });

    this.addAction({
      action: AppContainerVersionModelAction.WRITE,
      label: 'Write',
      visibility: CardinalVisibilityOption.PLATFORM,
      description: 'Create new container versions'
    });

    this.addAction({
      action: AppContainerVersionModelAction.PROMOTE,
      label: 'Promote',
      visibility: CardinalVisibilityOption.PLATFORM,
      description: 'Promote beta container version to production track'
    });
  }
}
