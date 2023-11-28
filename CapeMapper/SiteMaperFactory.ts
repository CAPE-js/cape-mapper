import {SiteMapper} from "./SiteMapper";
import {SiteConfigValidator} from "./Validators/SiteConfigValidator";
import {injected} from "brandi";
import {TOKENS} from "./tokens";
import {ValidationErrors} from "./ValidationErrors";

export class SiteMapperFactory {
    constructor(
        private siteConfigValidator: SiteConfigValidator
    ) {}

    public createSiteMapper( unvalidatedSiteConfig: any ) : SiteMapper {
        const issues = this.siteConfigValidator.validate(unvalidatedSiteConfig)
        if( issues.length > 0 ) {
            throw new ValidationErrors(issues)
        }
        return new SiteMapper( unvalidatedSiteConfig )
    }
}

injected(SiteMapperFactory, TOKENS.siteConfigValidator)
