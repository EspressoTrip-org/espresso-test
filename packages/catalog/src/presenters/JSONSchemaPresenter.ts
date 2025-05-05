import _ from 'lodash';

import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { CardinalSchema } from '../definitions/CardinalSchema';
import { CardinalCatalogStore } from '../stores/CardinalCatalogStore';
import { CardinalModelEntity, CardinalScopeOption } from '../entities/CardinalModelEntity';
import { CardinalModelLabelEntity } from '../entities/CardinalModelLabelEntity';
import { CardinalVisibilityOption } from '../entities/AbstractCardinalEntity';

/**
 * This takes a Cardinal Catalog Store uses it's definitions to enrich
 * the generic Cardinal schema to include model specific validations.
 */
export class JSONSchemaPresenter {
  constructor(
    protected store: CardinalCatalogStore,
    protected enabledVisibility: CardinalVisibilityOption[] = [CardinalVisibilityOption.PUBLIC]
  ) {}

  /**
   * Merges the catalog Resource types with the Cardinal Schema
   */
  generateJSONSchema(): JSONSchema7 {
    // Don't include internal models in the schema
    const models = this.store.getAllModels().filter((model) => this.enabledVisibility.includes(model.visibility));

    const modelDefinitions = _.chain(models)
      .keyBy((model) => model.name)
      .mapValues((model) => this.generateModelResourceSelector(model))
      .value();

    // Update Cardinal Schema with Catalog model definitions
    return {
      ...CardinalSchema,
      definitions: {
        ...CardinalSchema.definitions,
        ...modelDefinitions,
        // The JSON7Schema type does not play well with existing schema definitions.
        // Typescript interprets the imported schema object fields like the `type: 'object'` entry
        // as the `type` field having the type `string`, but the JSON7Schema type expects
        // the `type` field to be 'object' or 'array' or 'string' etc.
        // @ts-ignore
        PolicyStatement: {
          ...CardinalSchema.definitions.PolicyStatement,
          // Apply action options based on resource selection
          allOf: models.map((model) => this.generateModelActionConditions(model)!)
        },
        Resource: {
          ...CardinalSchema.definitions.Resource,
          type: 'object',
          // Hack in which items need a scope on the resource level (outside the ResourceSelector model)
          allOf: [
            {
              if: {
                properties: {
                  selector: {
                    properties: {
                      model: {
                        anyOf: _.chain(models)
                          .filter((model) => model.scope == CardinalScopeOption.SCOPED)
                          .map((model) => ({ const: model.name }))
                          .value()
                      }
                    }
                  }
                }
              },
              then: {
                required: ['scope']
              }
            },
            // Don't allow unscoped resources to have a scope
            {
              if: {
                properties: {
                  selector: {
                    properties: {
                      model: {
                        anyOf: _.chain(models)
                          .filter((model) => model.scope == CardinalScopeOption.UNSCOPED)
                          .map((model) => ({ const: model.name }))
                          .value()
                      }
                    }
                  }
                }
              },
              then: {
                not: {
                  required: ['scope']
                }
              }
            }
          ]
        },
        // Overwrite the standard Cardinal Resource Selector to include model definitions
        ResourceSelector: {
          anyOf: models.map((model) => ({ $ref: `#/definitions/${model.name}` }))
        }
      }
    };
  }

  /**
   * Actions are enums defined on the PolicyStatement model.
   * The allowed actions are on a higher level than the ResourceSelector
   * in a policy statement. This makes it tricky to define as a static type.
   * We can use JSON schema conditional typing.
   * We can only conditionally apply action enum validations
   * if the resource selector is a single resource.
   */
  private generateModelActionConditions(model: CardinalModelEntity<any>): JSONSchema7['if'] {
    return {
      if: {
        properties: {
          resources: {
            // There must only be one target resource, which is this model
            items: {
              properties: {
                selector: {
                  properties: {
                    model: { const: model.name }
                  }
                }
              }
            }
          }
        }
      },
      then: {
        properties: {
          actions: {
            type: 'array',
            items: {
              anyOf: model
                .getAllActions()
                .filter((action) => this.enabledVisibility.includes(action.visibility))
                .map((action) => ({ const: action.name, title: action.description })),
              additionalItems: true
            }
          }
        }
      }
    };
  }

  /**
   * Generate the allowed label options for a model
   */
  private generateLabelSchema(label: CardinalModelLabelEntity): JSONSchema7 {
    if (label.options.length) {
      return {
        enum: label.options,
        description: label.description
      };
    } else {
      return {
        type: 'string',
        description: label.description
      };
    }
  }

  /**
   * Generates a JSON schema for a model ResourceSelector
   */
  private generateModelResourceSelector(model: CardinalModelEntity<any>): JSONSchema7Definition {
    // This is shared between ID and Label Resource Selectors
    const modelDefinition: JSONSchema7Definition = {
      type: 'object',
      additionalProperties: false,
      properties: {
        model: {
          description: model.description,
          const: model.name
        }
      }
    };

    if (model.parents.length) {
      modelDefinition.properties!.parents = {
        type: 'array',
        items: {
          anyOf: model.parents.map((parent) => ({
            $ref: `#/definitions/${parent}`
          }))
        }
      };
    }

    // The selector can be by ID or by labels
    return {
      anyOf: [
        // Identify resources by id
        {
          ...modelDefinition,
          properties: {
            ...modelDefinition.properties,
            id: { $ref: '#/definitions/$Or<string>' }
          },
          required: ['id', 'model']
        },
        // Identify resource by labels
        {
          ...modelDefinition,
          properties: {
            ...modelDefinition.properties,
            labels: {
              properties: model.labels.reduce((acc: Record<string, any>, label) => {
                acc[label.name] = this.generateLabelSchema(label);
                return acc;
              }, {})
            }
          },
          required: ['labels', 'model']
        }
      ]
    };
  }
}
