import { ValidationError } from './ValidationError.js'
import { FieldMapper } from './FieldMapper.js'
import { BufferToTable } from './BufferToTable.js'
import { Helpers } from './Helpers.js'

class DatasetMapper {
  config = {}
  fieldMappers = []
  format = 'csv'

  /**
   * Maps a single dataset in a CAPE system.
   * @param {Object} config - the JSON structure defining a single dataset
   * @throws {ValidationError}
   */
  constructor (config) {
    this.config = config

    const ids = {}
    this.config.fields.forEach((fieldConfig) => {
      const fieldMapper = new FieldMapper(fieldConfig)
      this.fieldMappers.push(fieldMapper)
      // check the ids are unique
      if (Object.prototype.hasOwnProperty.call(ids, fieldMapper.config.id)) {
        throw ValidationError(`Field ID '${fieldMapper.config.id}' was not unique`)
      }
      ids[fieldMapper.config.id] = fieldMapper
    })
    delete this.config.fields

    // check the sort fields exist
    this.config.sort.forEach((fieldId) => {
      if (!Object.prototype.hasOwnProperty.call(ids, fieldId)) {
        throw new ValidationError(`Invalid sort field ${fieldId}`)
      }
    })

    if (!Object.prototype.hasOwnProperty.call(ids, this.config.id_field)) {
      throw new ValidationError(`Invalid id_field ${this.config.id_field}`)
    }

    // format does not need to be passed through to the output json, so remove it and
    // store it as an object property instead
    if (Object.prototype.hasOwnProperty.call(this.config, 'format')) {
      this.format = this.config.format
      delete this.config.format
    }
  }

  /**
   * Map one or more byte streams into a list of records for this dataset. This is not stateless as it will
   * increment the autoIncrementCounter property used by fields who's source is set to AUTO.
   * This uses the format specified by the format parameter of the dataset config.
   * @param {Buffer|Buffer[]} byteStream
   * @returns {{records: [], missing_headings: [], unmapped_headings: [], config: {}}} an array of CAPE records
   */
  generate (byteStream) {
    const output = {
      config: this.config,
      unmapped_headings: [],
      missing_headings: [],

      records: []
    }

    output.config.fields = []
    this.fieldMappers.forEach((fieldMapper) => {
      output.config.fields.push(fieldMapper.config)
    })

    byteStream = Helpers.ensureArray(byteStream)

    let autoIncrementCounter = 0
    const missingHeadings = {}

    byteStream.forEach((byteStream) => {
      const incomingRows = BufferToTable.convert(this.format, byteStream)

      // start with a list of all headings and check them off as we see them used.
      const unmappedHeadingsInTable = {}
      incomingRows[0].forEach((heading) => {
        unmappedHeadingsInTable[heading.trim()] = 1
      })

      const incomingRecords = Helpers.tableToRecords(incomingRows)

      incomingRecords.forEach((incomingRecord) => {
        autoIncrementCounter++
        const recordResult = this.mapRecord(incomingRecord, autoIncrementCounter)
        output.records.push(recordResult.record)
        // tick-off headings we've used
        Object.keys(recordResult.used_headings).forEach((heading) => {
          delete unmappedHeadingsInTable[heading]
        })

        // note any headings we expected in this table but didn't find
        Object.keys(recordResult.missing_headings).forEach((heading) => {
          missingHeadings[heading] = true
        })
      }) // end of foreach incoming_record

      // note any headings that were never used once we've done the whole table
      output.unmapped_headings = output.unmapped_headings.concat(Object.keys(unmappedHeadingsInTable))
      // ... and any headings we were missing
      output.missing_headings = output.missing_headings.concat(Object.keys(missingHeadings))
    }) // end of foreach byteStream

    return output
  }

  mapRecord (incomingRecord, autoIncrementCounter) {
    const result = { record: {}, used_headings: {}, missing_headings: {} }
    this.fieldMappers.forEach((fieldMapper) => {
      const fieldResult = fieldMapper.generate(incomingRecord, autoIncrementCounter)
      if (fieldResult.value !== null) {
        result.record[fieldMapper.config.id] = fieldResult.value
      }
      Object.keys(fieldResult.used_headings).forEach((key) => {
        result.used_headings[key] = true
      })
      Object.keys(fieldResult.missing_headings).forEach((key) => {
        result.missing_headings[key] = true
      })
    })
    return result
  }
}

export { DatasetMapper }
