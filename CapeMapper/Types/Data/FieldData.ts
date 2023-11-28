

export type FieldData = {
    // used by mapper & cape-core
    id: string
    type: 'text'|'date'|'integer'|'enum'|'ignore' // ignore would be better as a distinct setting outside fields
    multiple?: boolean
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