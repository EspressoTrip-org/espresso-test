import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum BuildContainerModelAction {
  DEPROVISION = 'deprovision',
  EXECUTE = 'execute',
  PROVISION = 'provision',
  READ = 'read'
}

export class BuildContainerModel extends CardinalModelEntity<BuildContainerModelAction> {
  constructor() {
    super({
      model: CardinalModel.BUILD_CONTAINER,
      label: 'Build Container',
      description: 'A container used for building app source code',
      scope: CardinalScopeOption.UNSCOPED
    });

    this.addAction({
      action: BuildContainerModelAction.READ,
      label: 'Read',
      description: 'Read build container properties'
    });

    this.addAction({
      action: BuildContainerModelAction.EXECUTE,
      label: 'Execute',
      description: 'Execute operations on the build container'
    });

    this.addAction({
      action: BuildContainerModelAction.PROVISION,
      label: 'Provision',
      description: 'Provision a build container for building app source code'
    });

    this.addAction({
      action: BuildContainerModelAction.DEPROVISION,
      label: 'Deprovision',
      description: 'Abort a build container'
    });

    this.addLabel({
      name: 'user_id',
      label: 'User ID',
      description: 'To scope access to the user who provisioned the build container. Usually "$actor.id"'
    });
  }
}
