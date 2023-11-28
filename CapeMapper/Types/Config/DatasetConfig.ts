import {FieldConfig} from "./FieldConfig";

export type DatasetConfig = {
    // used by mapper & cape-core
    fields: Array<FieldConfig>

    // mapper only
    format: 'xlsx'|'csv'

    // ignored by mapper (cape-core only)
    title: string
    id_field: string
    sort: string[]
    result_mode: 'search'|'filter'
    extra_pages?: string[]

    // deprecated (used in PHP version)
    data_dir?: 'string' // deprecated
    base_file_name?: string | Array<string>
}

