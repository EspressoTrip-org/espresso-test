import { AbstractCardinalEntity, AbstractCardinalEntityParams, CardinalEntityDefaults } from './AbstractCardinalEntity';

export interface CardinalModelLabelParams extends AbstractCardinalEntityParams {
  name: string;
  options?: string[];
}

export const CardinalLabelDefaultParams = {
  ...CardinalEntityDefaults,
  options: []
};

export class CardinalModelLabelEntity extends AbstractCardinalEntity<CardinalModelLabelParams> {
  constructor(params: CardinalModelLabelParams) {
    super(params, CardinalLabelDefaultParams);
  }

  get name() {
    return this.params.name;
  }

  get options() {
    return this.params.options;
  }
}
