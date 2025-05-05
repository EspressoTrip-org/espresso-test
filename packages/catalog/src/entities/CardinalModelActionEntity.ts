import { AbstractCardinalEntity, AbstractCardinalEntityParams, CardinalEntityDefaults } from './AbstractCardinalEntity';

export type BaseActionEnum = {};
export type BaseAction = BaseActionEnum[keyof BaseActionEnum];

export interface CardinalModelActionParams<
  ActionEnum extends BaseActionEnum = BaseActionEnum,
  Action = ActionEnum[keyof ActionEnum]
> extends AbstractCardinalEntityParams {
  action: Action | '*';
}

export class CardinalModelActionEntity<
  ActionEnum extends BaseActionEnum = BaseActionEnum
> extends AbstractCardinalEntity<CardinalModelActionParams<ActionEnum>> {
  constructor(params: CardinalModelActionParams<ActionEnum>) {
    super(params, CardinalEntityDefaults);
  }

  get name() {
    return this.params.action;
  }
}
