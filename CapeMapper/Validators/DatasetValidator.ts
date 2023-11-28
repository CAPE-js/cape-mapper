import {TOKENS} from "../tokens";
import {DatasetConfig} from "../Types/Config/DatasetConfig";
import {injected} from "brandi";
import {FieldValidator} from "./FieldValidator";

export class DatasetValidator {
    constructor(
        private fieldValidator: FieldValidator
    ) {
    }

    // returns a list of any consistency issues in the config
    public validate(datasetConfig: DatasetConfig): string[] {
        const issues : Array<string> = []
        const ids : Record<string,true>= {}
        datasetConfig.fields.forEach((fieldConfig) => {
            if (Object.prototype.hasOwnProperty.call(ids, fieldConfig.id)) {
                issues.push(`Field ID '${fieldConfig.id}' was not unique`)
            }
            ids[fieldConfig.id] = true
        })

        // validate each field
        datasetConfig.fields.forEach((fieldConfig) => {
            issues.concat(this.fieldValidator.validate(fieldConfig))
        })

        // check the sort fields exist
        datasetConfig.sort.forEach((fieldId) => {
            if (!Object.prototype.hasOwnProperty.call(ids, fieldId)) {
                issues.push(`Invalid sort field ${fieldId}`)
            }
        })

        if (!Object.prototype.hasOwnProperty.call(ids, datasetConfig.id_field)) {
            issues.push(`Invalid id_field ${datasetConfig.id_field}`)
        }

        return issues;
    }
}

injected(DatasetValidator, TOKENS.fieldValidator)
