import {DatasetData} from "./DatasetData";

export type SiteData = {
    status: string;
    errors?: string[];
    datasets?: Record<string, DatasetData>
}