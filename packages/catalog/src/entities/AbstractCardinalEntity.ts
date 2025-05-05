import _ from 'lodash';

export enum CardinalVisibilityOption {
  PLATFORM = 'platform',
  CUSTOMER_SUCCESS = 'customer-success',
  PUBLIC = 'public'
}

export interface AbstractCardinalEntityParams {
  label: string;
  description: string;
  visibility?: CardinalVisibilityOption;
  deprecated?: boolean;
}

export const CardinalEntityDefaults = {
  visibility: CardinalVisibilityOption.PUBLIC,
  deprecated: false
};

/**
 * Gets just the optional properties from a type
 * {required: number, optional?: number} => {optional?: number}
 */
export type OptionalPropertiesOf<T extends object> = Pick<
  T,
  Exclude<
    {
      [K in keyof T]: T extends Record<K, T[K]> ? never : K;
    }[keyof T],
    undefined
  >
>;

export class AbstractCardinalEntity<Params extends AbstractCardinalEntityParams> {
  protected params: Required<Params>;

  constructor(params: Params, defaults: Required<OptionalPropertiesOf<Params>>) {
    this.params = _.merge({}, defaults, params) as Required<Params>;
  }

  get label() {
    return this.displayDeprecated(this.params.label);
  }

  get description() {
    return this.displayDeprecated(this.params.description);
  }

  get deprecated() {
    return this.params.deprecated!;
  }

  get visibility() {
    return this.params.visibility!;
  }

  protected displayDeprecated(value: string) {
    return `${this.deprecated ? '[DEPRECATED] ' : ''}${value}`;
  }
}
