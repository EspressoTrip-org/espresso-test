import { CardinalModelEntity, CardinalScopeOption } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum PlanModelAction {
  CREATE = 'create',
  DELETE = 'delete',
  READ = 'read',
  UPDATE = 'update',
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade'
}

export class PlanModel extends CardinalModelEntity<PlanModelAction> {
  constructor() {
    super({
      model: CardinalModel.PLAN,
      label: 'Subscription plan',
      description:
        'Represents a billing subscription scoped to an organization. Orgs may have multiple plans, each with different set of configuration for reporting on metered parameters.',
      scope: CardinalScopeOption.SCOPED
    });

    this.addAction({
      action: PlanModelAction.READ,
      label: 'Read',
      description: 'Read plan.'
    });

    this.addAction({
      action: PlanModelAction.CREATE,
      label: 'Create',
      description: 'Create a new plan, potentially from a blueprint.'
    });

    this.addAction({
      action: PlanModelAction.DELETE,
      label: 'Delete',
      description: 'Delete an existing plan.'
    });

    this.addAction({
      action: PlanModelAction.UPDATE,
      label: 'Update',
      description: 'Update an existing plan.'
    });
    this.addAction({
      action: PlanModelAction.UPGRADE,
      label: 'Upgrade',
      description: 'Upgrade a plan.'
    });
    this.addAction({
      action: PlanModelAction.DOWNGRADE,
      label: 'Downgrade',
      description: 'Downgrade a plan.'
    });

    this.addParent(CardinalModel.ORG);
  }
}
