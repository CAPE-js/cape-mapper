import {SiteConfig} from "../Types/Config/SiteConfig";
import {TOKENS} from "../tokens";
import {DatasetConfig} from "../Types/Config/DatasetConfig";
import {injected} from "brandi";
import {DatasetValidator} from "./DatasetValidator";
import {SchemaValidator} from "./SchemaValidator";
import {ValidationErrors} from "../ValidationErrors";

export class SiteConfigValidator {
    constructor(
        private datasetValidator: DatasetValidator,
        private schemaValidator: SchemaValidator
    ) {
    }

    /* attempts to cast an unknown data structure into a valid cape config. */
    public typify(siteConfig: any): SiteConfig {
        const issues = this.validate(siteConfig)
        if (issues.length > 0) {
            throw new ValidationErrors(issues);
        }
        return siteConfig
    }

    /*
    takes an any and returns a list of validation issues
     */
    public validate(unvalidatedSiteConfig: any): string[] {
        // validate the json matches the schema
        let issues = this.schemaValidator.validate(unvalidatedSiteConfig)
        if (issues.length > 0) {
            return issues
        }

        const siteConfig: SiteConfig = unvalidatedSiteConfig
        // validate each dataset beyond what the schema can do
        siteConfig.datasets.forEach((datasetConfig: DatasetConfig) => {
            issues = issues.concat(this.validate(datasetConfig))
        })

        return issues
    }
}

injected(SiteConfigValidator, TOKENS.datasetValidator, TOKENS.schemaValidator)
