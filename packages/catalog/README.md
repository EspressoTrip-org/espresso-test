# Cardinal Catalog

This package serves as a central catalog of all the Cardinal resource models.

Models are defined by their associated auth actions; label and parent selectors. 

Having the models declared here allows for micro-services to share/import the relevant enums for use in authorization logic. 

A holistic catalog of all resources also allows for Cardinal policy linting and validation (e.g. in OVERRIDE).

# Usages

## Micro-service auth

``` typescript
    import { DraftModelAction, DraftType, DraftSharedOption, CardinalModel } from '@journeyapps-platform/cardinal-catalog';

    async function someAuthorizer() {
        return cardinal.satisfies(viewer.permissions, DraftModelAction.COMMIT, {
          selector: {
            model: CardinalModel.DRAFT,
            labels: {
                type: DraftType.USER
            }
          }
        })
    }

```

## Policy auto-complete and validation

The store of Cardinal models can be used to validate the Policy JSON that is edited in OVERRIDE.
OVERRIDE supports JSON Schema validators and automatic auto-complete linting.

The store is transformed into a JSON-schema which is imported into OVERRIDE.

### Interesting points
The structure of a Cardinal policy allows for a lot of flexibility. This makes it somewhat tricky to implement validation with static/generic types. For example the in a policy statement the `actions` are specified before the relevant `ResourceSelector`, and there can be multiple resource selectors which relate to the actions. Linking the typings between multiple array "jumps" has been implemented using conditional schemas. 

