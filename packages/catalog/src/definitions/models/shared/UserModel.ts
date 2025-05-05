import { CardinalModelEntity } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum UserModelAction {
  CREATE = 'create',
  DELETE = 'delete',
  MANAGE_ASSIGNMENTS = 'manage-assignments',
  MANAGE_ORG_ROLE_ASSIGNMENTS = 'manage-org-role-assignments',
  READ = 'read',
  READ_METRICS = 'read-metrics',
  UPDATE = 'update'
}

export class UserModel extends CardinalModelEntity<UserModelAction> {
  constructor() {
    super({
      model: CardinalModel.USER,
      label: 'User',
      description: 'A JourneyApps user'
    });

    this.addAction({
      action: UserModelAction.READ,
      label: 'Read',
      description: "Read a user's info"
    });

    this.addAction({
      action: UserModelAction.CREATE,
      label: 'Create',
      description: 'Create a new user'
    });

    this.addAction({
      action: UserModelAction.DELETE,
      label: 'Delete',
      description: 'Delete a user'
    });

    this.addAction({
      action: UserModelAction.UPDATE,
      label: 'Update',
      description: 'Update a user'
    });

    this.addAction({
      action: UserModelAction.READ_METRICS,
      label: 'Read metrics',
      description: 'Read users OXIDE usage metrics'
    });

    this.addAction({
      action: UserModelAction.MANAGE_ASSIGNMENTS,
      label: 'Manage assignments',
      description: "Manage user's permissions and policy assignments"
    });

    this.addAction({
      action: UserModelAction.MANAGE_ORG_ROLE_ASSIGNMENTS,
      label: 'Manage org assignments',
      description: "Manage user's role assignments in an org"
    });
  }
}
