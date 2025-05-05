import { CardinalVisibilityOption } from '../../../entities/AbstractCardinalEntity';
import { CardinalModelEntity } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum AppModelAction {
  CREATE = 'create',
  DELETE = 'delete',
  READ = 'read',
  READ_ANALYTICS = 'read:analytics',
  UPDATE = 'update',
  WRITE = 'write',
  UPDATE_TRIAL = 'update-trial',
  UPDATE_LOCKS = 'update-locks'
}

/**
 * Internal actions intended to be used by the systems themselves
 */
export enum AppModelSystemActions {
  SYSTEM_CREATE = 'system-create'
}

export class AppModel extends CardinalModelEntity<AppModelAction> {
  constructor() {
    super({
      model: CardinalModel.APP,
      label: 'App',
      description: 'A JourneyApps Application'
    });

    this.addAction({
      action: AppModelAction.READ,
      label: 'Read',
      description: 'Read an app'
    });

    this.addAction({
      action: AppModelAction.CREATE,
      label: 'Create',
      description: 'Create an app'
    });

    this.addAction({
      action: AppModelSystemActions.SYSTEM_CREATE,
      label: 'System Create',
      description: 'Create an app resource on accounts hub as part of the app creation process (Use with caution).'
    });

    this.addAction({
      action: AppModelAction.WRITE,
      label: 'Write',
      description: "Write changes to an app's source code"
    });

    this.addAction({
      action: AppModelAction.DELETE,
      label: 'Delete',
      description: 'Delete an app'
    });

    this.addAction({
      action: AppModelAction.UPDATE,
      label: 'Update',
      description: 'Update an app'
    });

    this.addAction({
      action: AppModelAction.READ_ANALYTICS,
      label: 'Read Analytics',
      description: 'Read app usage analytics',
      visibility: CardinalVisibilityOption.PLATFORM
    });

    this.addAction({
      action: AppModelAction.UPDATE_TRIAL,
      label: 'Update Trial',
      description: 'Allows an app to be upgraded or downgraded from a trial.'
    });

    this.addAction({
      action: AppModelAction.UPDATE_LOCKS,
      label: 'Update Locks',
      description:
        "Update an app's locked state (Locked apps prevent user access due to expired trials / overdue payments etc..)."
    });

    this.addParent(CardinalModel.ORG);
  }
}
