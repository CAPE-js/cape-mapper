import { DatasetMapper } from './DatasetMapper.js'
import { ValidationError } from './ValidationError.js'

import Ajv from 'ajv'
import { readFileSync } from 'fs'

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true })

const rawJsonConfig = readFileSync(new URL('../../schema.json', import.meta.url))

const capeSchema = JSON.parse(rawJsonConfig)
const validate = ajv.compile(capeSchema)

class SiteMapper {
  datasetMappers = []

  /**
   * Construct a new mapper class using the given config, taken from config.json
   * @param {Object} config
   * @throws {ValidationError}
   */
  constructor (config) {
    if (!validate(config)) {
      throw new ValidationError(ajv.errorsText(validate.errors))
    }

    config.datasets.forEach((datasetConfig) => {
      const datasetMapper = new DatasetMapper(datasetConfig)
      this.datasetMappers.push(datasetMapper)
    })
  }

  /**
   *  load relevant files from filesystem and map them using the config. nb. this will not work with azure
   *  @param {Object.<string,Buffer|Buffer[]>} sourceData. An array of byte streams to import for each dataset. The key is the ID of the dataset.
   *  @return {Array}
   */
  generate (sourceData) {
    let outputData
    try {
      const issues = []
      const datasets = []
      this.datasetMappers.forEach((datasetMapper) => {
        const datasetOutput = datasetMapper.generate(sourceData[datasetMapper.config.id])
        datasets.push(datasetOutput)

        // turn any issues into errors
        if (datasetOutput.unmapped_headings.length > 0) {
          issues.push('Dataset ' + datasetMapper.config.id + ' has the following unexpected headings: ' +
            datasetOutput.unmapped_headings.join(', '))
        }
        if (datasetOutput.missing_headings.length > 0) {
          issues.push('Dataset ' + datasetMapper.config.id + ' has the following headings expected but missing from all data sources: ' +
            datasetOutput.missing_headings.join(', '))
        }
      })
      if (issues.length) {
        outputData = {
          status: 'ERROR',
          errors: issues
        }
      } else {
        outputData = {
          status: 'OK',
          datasets
        }
      }
    } catch (error) {
      outputData = {
        status: 'ERROR',
        errors: [error.toString()]
      }
      // Give full details to STDERR
      console.error(error)
    }
    return outputData
  }
}

export { SiteMapper }
