import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum PlanBlueprintModelAction {
  CREATE = 'create',
  DELETE = 'delete',
  READ = 'read',
  UPDATE = 'update'
}

export class PlanBlueprintModel extends CardinalModelEntity<PlanBlueprintModelAction> {
  constructor() {
    super({
      model: CardinalModel.PLAN_BLUEPRINT,
      label: 'Subscription plan blueprint',
      description:
        'Blueprints are pricing plan templates used to create subscription plans, ' +
        'some of which are applied automatically by system events (such as free/pro plan etc..)',
      scope: CardinalScopeOption.UNSCOPED
    });

    this.addAction({
      action: PlanBlueprintModelAction.READ,
      label: 'Read',
      description: 'Read blueprints'
    });

    this.addAction({
      action: PlanBlueprintModelAction.CREATE,
      label: 'Create',
      description: 'Create a new blueprint'
    });

    this.addAction({
      action: PlanBlueprintModelAction.DELETE,
      label: 'Delete',
      description: 'Delete an existing blueprint (managed blueprints cannot be deleted)'
    });

    this.addAction({
      action: PlanBlueprintModelAction.UPDATE,
      label: 'Update',
      description: 'Update an existing blueprint (managed blueprints can also be updated)'
    });
  }
}
