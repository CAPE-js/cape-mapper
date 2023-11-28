

export type FieldConfig = {
    // used by mapper & cape-core
    id: string
    type: 'string'|'date'|'integer'|'enum'|'ignore' // ignore would be better as a distinct setting outside fields
    multiple?: boolean

    // mapper only
    source_heading?: string|Array<string>
    source_split?: string
    source_chars?: number

    // ignored by mapper (cape-core only)
    label: string
    placeholder?: {
        is?: string
        between?: Array<string> // needs exactly 2 items
    }
    default?: Array<string>
    change_filter_mode?: boolean
    default_filter_mode?: 'is'|'one-of'|'between'|'set'|'not-set'
    description?: string
    search?: boolean
    style?: {
        is?: 'radio'|'select'
        'one-of':  'checkbox'|'multiselect'
    }
    min?: number
    max?: number

}