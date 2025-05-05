import { CardinalModelEntity } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum OpsqlPipelineAction {
  LIST = 'list',
  READ_LOGS = 'read-logs',
  PROVISION = 'provision',
  DELETE = 'delete',
  GET = 'get'
}

export class OpsqlPipelineModel extends CardinalModelEntity<OpsqlPipelineAction> {
  constructor() {
    super({
      model: CardinalModel.OPSQL_PIPELINE,
      label: 'Opsql Pipeline',
      description: 'An Opsql pipeline replicates selected App Data to another Database'
    });

    this.addAction({
      action: OpsqlPipelineAction.LIST,
      label: 'List',
      description: 'List pipelines'
    });

    this.addAction({
      action: OpsqlPipelineAction.READ_LOGS,
      label: 'Read logs',
      description: 'Read pipeline logs'
    });

    this.addAction({
      action: OpsqlPipelineAction.PROVISION,
      label: 'Provision',
      description: 'Provision pipelines'
    });

    this.addAction({
      action: OpsqlPipelineAction.DELETE,
      label: 'Delete',
      description: 'Delete pipelines'
    });

    this.addAction({
      action: OpsqlPipelineAction.GET,
      label: 'Get',
      description: 'Get pipelines'
    });
  }
}
