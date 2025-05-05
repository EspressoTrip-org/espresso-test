import { CardinalModelEntity } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum OpsqlUserAction {
  CREATE = 'create',
  DELETE = 'delete',
  LIST = 'list'
}

export class OpsqlUserModel extends CardinalModelEntity<OpsqlUserAction> {
  constructor() {
    super({
      model: CardinalModel.OPSQL_USER,
      label: 'Opsql User',
      description: 'User management for Opsql pipelines'
    });

    this.addAction({
      action: OpsqlUserAction.LIST,
      label: 'List',
      description: 'List pipeline users'
    });

    this.addAction({
      action: OpsqlUserAction.DELETE,
      label: 'Delete',
      description: 'Delete opsql pipeline users'
    });
  }
}
