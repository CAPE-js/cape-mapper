import {RecordData} from "./RecordData";
import {FieldData} from "./FieldData";

export type DatasetData  = {
    fields: Array<FieldData>
    title: string
    id_field: string
    sort: string[]
    result_mode: 'search'|'filter'
    extra_pages?: string[]
    records: Array<RecordData>

}

