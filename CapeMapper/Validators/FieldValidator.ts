import {FieldConfig} from "../Types/Config/FieldConfig";

export class FieldValidator {

    public validate(fieldConfig: FieldConfig) {
        const issues = []
        if (fieldConfig.type !== 'ignore' && !Object.prototype.hasOwnProperty.call(fieldConfig, 'label')) {
            issues.push('Fields must have label, unless they are type \'ignore\'')
        }

        // AUTO can't be part of a list of source headings
        if (Array.isArray(fieldConfig.source_heading) && fieldConfig.source_heading.length > 1) {
            fieldConfig.source_heading.forEach((v) => {
                if (v === 'AUTO') {
                    issues.push('AUTO can\'t appear in a list of source_headings')
                }
            })
        }

        // check the default_filter_mode makes sense for the type. We can assume the type is a legal value
        // as we've already done the basic schema validation
        if (fieldConfig['default_filter_mode'] != null) {
            const allowedModesByType: Record<string, Array<string>> = {
                text: ['set', 'not-set', 'is', 'contains'],
                freetext: ['set', 'not-set', 'is', 'contains'],
                integer: ['set', 'not-set', 'is', 'between'],
                date: ['set', 'not-set', 'is', 'between'],
                enum: ['set', 'not-set', 'is', 'one-of'],
                ignore: []
            }
            const allowedModes = allowedModesByType[fieldConfig.type]
            if (!allowedModes.includes(fieldConfig.default_filter_mode)) {
                issues.push('Fields of type \'' + fieldConfig.type + '\' can\'t have a default_filter_mode of \'' + fieldConfig.default_filter_mode + '\' (allowed valiues are ' + allowedModes.join(', ') + ')')
            }
        }

        return issues
    }
}
