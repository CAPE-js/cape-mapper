/* container.ts */

import {Container} from 'brandi'

import {TOKENS} from './tokens'
import {SiteConfigValidator} from "./Validators/SiteConfigValidator"
import {SchemaValidator} from "./Validators/SchemaValidator";
import Ajv from "ajv"
import schemaData  from '../schema.json'
import {DatasetValidator} from "./Validators/DatasetValidator";
import {FieldValidator} from "./Validators/FieldValidator";

export const container = new Container()

container
    .bind(TOKENS.siteConfigValidator)
    .toInstance(SiteConfigValidator)
    .inTransientScope()

container
    .bind(TOKENS.schemaValidator)
    .toInstance(SchemaValidator)
    .inTransientScope()

container
    .bind(TOKENS.datasetValidator)
    .toInstance(DatasetValidator)
    .inTransientScope()

container
    .bind(TOKENS.fieldValidator)
    .toInstance(FieldValidator)
    .inTransientScope()

container
    .bind(TOKENS.ajv)
    .toConstant(new Ajv({allErrors: true, allowUnionTypes: true}))

container
    .bind(TOKENS.schemaData)
    .toConstant(schemaData)