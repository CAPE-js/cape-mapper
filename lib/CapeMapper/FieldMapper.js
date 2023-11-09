import { ValidationError } from './ValidationError.js'
import { Helpers } from './Helpers.js'

class FieldMapper {
  config = {}
  source_headings = []
  source_split
  source_chars

  /**
   * Maps data from a tabular source to a single field in a record in a CAPE system.
   * @param {Object} config - the JSON structure defining a single field
   * @throws {ValidationError}
   */
  constructor (config) {
    this.config = config

    // additional validation on top of what the schema can do
    if (this.config.type !== 'ignore' && !Object.prototype.hasOwnProperty.call(this.config, 'label')) {
      throw new ValidationError('Fields must have label, unless they are type \'ignore\'')
    }

    // set the default for cleaner code later on
    if (!Object.prototype.hasOwnProperty.call(this.config, 'multiple')) {
      this.config.multiple = false
    }
    // remove mapper-specific properties from config and put them into object properties
    if (Object.prototype.hasOwnProperty.call(this.config, 'source_heading')) {
      this.source_headings = Helpers.ensureArray(this.config.source_heading)

      // AUTO can't be part of a list of source headings
      if (this.source_headings > 1) {
        this.source_headings.forEach((v) => {
          if (v === 'AUTO') {
            throw new ValidationError('AUTO can\'t appear in a list of source_headings')
          }
        })
      }

      delete this.config.source_heading
    }

    // check the default_filter_mode makes sense for the type. We can assume the type is a legal value
    // as we've already done the basic schema validation
    if (Object.prototype.hasOwnProperty.call(this.config, 'default_filter_mode')) {
      const allowedModesByType = {
        text: ['set', 'not-set', 'is', 'contains'],
        freetext: ['set', 'not-set', 'is', 'contains'],
        integer: ['set', 'not-set', 'is', 'between'],
        date: ['set', 'not-set', 'is', 'between'],
        enum: ['set', 'not-set', 'is', 'one-of'],
        ignore: []
      }
      const allowedModes = allowedModesByType[this.config.type]
      if (!allowedModes.includes(this.config.default_filter_mode)) {
        throw new ValidationError('Fields of type \'' + this.config.type + '\' can\'t have a default_filter_mode of \'' + this.config.default_filter_mode + '\' (allowed valiues are ' + allowedModes.join(', ') + ')')
      }
    }

    // Here is where we might want to validate that the default_filter_mode type is allowed for the field type

    if (Object.prototype.hasOwnProperty.call(this.config, 'source_split')) {
      this.source_split = this.config.source_split
      delete this.config.source_split
    }
    if (Object.prototype.hasOwnProperty.call(this.config, 'source_chars')) {
      this.source_chars = this.config.source_chars
      delete this.config.source_chars
    }
  }

  /**
   * returns the value for this field based on the single incoming record, and which headings were used and any
   * columns that were expected but not found
   * @param {object} incomingRecord - the record from the tabular data source
   * @param {integer} autoIncrementCounter - the next ID for an autoincrement field
   * @return {{ value: any, used_headings: {}, missing_headings: {} }}
   */
  generate (incomingRecord, autoIncrementCounter) {
    const result = {
      value: null,
      used_headings: {},
      missing_headings: {}
    }

    // if this field is an autoIncrementCounter style field we just return that right away. No real source headings are
    // used.
    if (this.source_headings[0] === 'AUTO') {
      result.value = autoIncrementCounter
    } else {
      const sourceHeadingsUsedInThisField = this.select_source_headings(incomingRecord, result)
      if (this.config.type !== 'ignore') {
        if (this.config.multiple) {
          result.value = this.process_raw_values(sourceHeadingsUsedInThisField, incomingRecord)
        } else {
          const processedValues = this.process_raw_values(sourceHeadingsUsedInThisField, incomingRecord)
          if (processedValues.length > 0) {
            result.value = processedValues[0]
          }
        }
      }
    }
    return result
  }

  /**
   * Use the list of source headings to process the raw tabular cells into values for our
   * cape dataset.
   * @param {string[]} sourceHeadingsUsedInThisField
   * @param {Object} incomingRecord
   * @returns {Array.<string|integer>}
   */
  process_raw_values (sourceHeadingsUsedInThisField, incomingRecord) {
    const processedValues = []
    sourceHeadingsUsedInThisField.forEach((actualHeading) => {
      if (incomingRecord[actualHeading] !== null) {
        let rawValues
        // if it's any kind of null value then it's not valid
        // noinspection EqualityComparisonWithCoercionJS
        if (this.config.multiple && this.source_split !== undefined) {
          rawValues = incomingRecord[actualHeading].split(new RegExp(this.source_split))
        } else {
          rawValues = [incomingRecord[actualHeading]]
        }

        // a few types of field go through a little filtering now
        rawValues.forEach((value) => {
          if (value !== '' && value !== null) {
            processedValues.push(this.process_single_raw_value(value))
          }
        })
      }
    })
    return processedValues
  }

  /**
   * Do any processing needed to turn a single source value into a cape value, including casting to correct type,
   * trimming dates to 10 characters and doing the source_chars trimming, if needed.
   * @param {string | number }
   * @return {string | number}
   */
  process_single_raw_value (value) {
    // trim if source_chars was set
    if (this.source_chars) {
      value = value.substring(0, this.source_chars)
    }

    // cast to a string (unless it's an integer)
    if (this.config.type === 'integer') {
      value = Number(value)
    } else {
      value = String(value)
    }

    // trim date to 10 characters (assumes ISO8601 format date)
    if (this.config.type === 'date') {
      value = value.substring(0, 10)
    }
    return value
  }

  /**
   * Work out all the headings in the incoming record we actually want to look at.
   * we also use this to set the headings we used.
   * @param {Object} incomingRecord
   * @param {{used_headings: {}, missing_headings: {}, value: integer|string}} result
   * @return {string[]}
   */
  select_source_headings (incomingRecord, result) {
    const sourceHeadingsUsedInThisField = []

    this.source_headings.forEach((sourceHeading) => {
      let found = false
      // sorting should ensure numbers from 1-9 are in order, it might need a natural sort instead to
      // handle really long lists of multiple values
      const incomingHeadings = Object.keys(incomingRecord).sort()
      incomingHeadings.forEach((incomingHeading) => {
        if (sourceHeading === incomingHeading) {
          sourceHeadingsUsedInThisField.push(incomingHeading)
          result.used_headings[incomingHeading] = true
          found = true
        } else if (this.config.multiple) {
          // if the field is multiple, any headings with the sourceHeading plus a space an number on the end
          // are in scope too.
          const baseHeading = incomingHeading.replace(/\s+\d+$/, '')
          if (sourceHeading === baseHeading) {
            sourceHeadingsUsedInThisField.push(incomingHeading)
            result.used_headings[incomingHeading] = true
            found = true
          }
        }
      })

      if (!found) {
        result.missing_headings[sourceHeading] = true
      }
    })
    return sourceHeadingsUsedInThisField
  }
}

export { FieldMapper }
