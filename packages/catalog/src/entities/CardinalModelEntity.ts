import { CardinalModel } from '../definitions/Models';
import { BaseActionEnum, CardinalModelActionEntity, CardinalModelActionParams } from './CardinalModelActionEntity';
import { CardinalModelLabelEntity, CardinalModelLabelParams } from './CardinalModelLabelEntity';
import { AbstractCardinalEntity, AbstractCardinalEntityParams, CardinalEntityDefaults } from './AbstractCardinalEntity';

export enum CardinalScopeOption {
  SCOPED = 'scoped',
  UNSCOPED = 'unscoped',
  BOTH = 'both'
}

export interface CardinalModelParams extends AbstractCardinalEntityParams {
  model: CardinalModel;
  scope?: CardinalScopeOption;
}

export const CardinalModelParamsDefaults = {
  ...CardinalEntityDefaults,
  scope: CardinalScopeOption.SCOPED
};

export class CardinalModelEntity<
  ActionEnum extends BaseActionEnum = BaseActionEnum,
  Action = ActionEnum[keyof ActionEnum]
> extends AbstractCardinalEntity<CardinalModelParams> {
  protected actions: Map<Action, CardinalModelActionEntity<ActionEnum>>;

  labels: CardinalModelLabelEntity[];
  parents: CardinalModel[];

  constructor(params: CardinalModelParams) {
    super(params, CardinalModelParamsDefaults);
    this.parents = [];
    this.labels = [];

    this.actions = new Map();

    // All models can have a '*' action which allows any action
    this.addAction({
      action: '*',
      description: 'Allows all actions',
      label: 'All'
    });
  }

  get name() {
    return this.params.model;
  }

  get scope() {
    return this.params.scope;
  }

  getAction(action: Action) {
    return this.actions.get(action);
  }

  getAllActions() {
    return Array.from(this.actions.values());
  }

  addAction(params: CardinalModelActionParams<ActionEnum>) {
    this.actions.set(params.action as Action, new CardinalModelActionEntity(params));
  }

  addParent(parent: CardinalModel) {
    this.parents.push(parent);
  }

  addLabel(params: CardinalModelLabelParams) {
    this.labels.push(new CardinalModelLabelEntity(params));
  }
}
