
// entry to the CapeMapper system

import {container} from "./container";
import {TOKENS} from "./tokens";
import {SiteMapperFactory} from "./SiteMaperFactory";
import {SiteMapper} from "./SiteMapper";

export class Mapper {

    static getMapper( config : any) : SiteMapper {
        const siteMapperFactory = new SiteMapperFactory(container.get(TOKENS.siteConfigValidator))
        return siteMapperFactory.createSiteMapper(config);
    }

}


