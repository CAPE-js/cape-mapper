
import {SiteData} from "./Types/Data/SiteData";
import {SiteConfig} from "./Types/Config/SiteConfig";

export class SiteMapper  {
    constructor(validConfig: SiteConfig) {
    }

    generate(tabularData: Buffer[]): SiteData {
        return { 'status':'OK'}
    }
}

