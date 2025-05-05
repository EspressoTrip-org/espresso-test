/**
 * A script to generate a compiled JSON schema from the Cardinal Catalog Store.
 */

import * as fs from 'fs';
import * as path from 'path';
import findRoot from 'find-root';

import { CardinalCatalogStore } from '../stores/CardinalCatalogStore';
import { JSONSchemaPresenter } from '../presenters/JSONSchemaPresenter';

const store = new CardinalCatalogStore();

const presenter = new JSONSchemaPresenter(store);
const jsonSchema = presenter.generateJSONSchema();

const schemaPath = path.join(findRoot(__dirname), 'schema', 'schema.json');

fs.writeFileSync(schemaPath, JSON.stringify(jsonSchema, null, 2));
