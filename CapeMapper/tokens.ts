/* tokens.ts */
import { token } from 'brandi';
import {SiteConfigValidator} from "./Validators/SiteConfigValidator";
import Ajv from "ajv";
import {SchemaValidator} from "./Validators/SchemaValidator";
import {DatasetValidator} from "./Validators/DatasetValidator";
import {FieldValidator} from "./Validators/FieldValidator";

export const TOKENS = {
  siteConfigValidator: token<SiteConfigValidator>('siteConfigValidator'),
  datasetValidator: token<DatasetValidator>('datasetValidator'),
  schemaValidator: token<SchemaValidator>('schemaValidator'),
  fieldValidator: token<FieldValidator>('fieldValidator'),
  ajv: token<Ajv>('configValidator'),
  schemaData: token<object>( 'schemaData')
}
