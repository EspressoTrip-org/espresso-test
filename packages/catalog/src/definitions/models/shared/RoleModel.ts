import { CardinalModelEntity } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum RoleModelAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
}

export class RoleModel extends CardinalModelEntity<RoleModelAction> {
  constructor() {
    super({
      model: CardinalModel.ROLE,
      label: 'Role',
      description: 'A collection of policies for an Organization'
    });

    this.addAction({
      action: RoleModelAction.CREATE,
      label: 'Create',
      description: 'Create a new role'
    });

    this.addAction({
      action: RoleModelAction.UPDATE,
      label: 'Update',
      description: 'Update role policies'
    });

    this.addAction({
      action: RoleModelAction.READ,
      label: 'Read',
      description: 'Read role policies'
    });

    this.addAction({
      action: RoleModelAction.DELETE,
      label: 'Delete',
      description: 'Delete role (does not delete associated policies)'
    });
  }
}
