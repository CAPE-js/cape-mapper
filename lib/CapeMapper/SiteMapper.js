import {DatasetMapper} from "./DatasetMapper.js";
import {ValidationError} from "./ValidationError.js"

import Ajv from 'ajv';
import {readFileSync} from 'fs';

let ajv = new Ajv({allErrors: true, allowUnionTypes: true});

const rawJsonConfig = readFileSync(new URL("../../schema.json", import.meta.url));

const capeSchema = JSON.parse(rawJsonConfig);
const validate = ajv.compile(capeSchema);

class SiteMapper {
    datasetMappers = [];

    /**
     * Construct a new mapper class using the given config, taken from config.json
     * @param {Object} config
     * @throws {ValidationError}
     */
    constructor(config) {
        if (!validate(config)) {
            throw new ValidationError(ajv.errorsText(validate.errors))
        }

        config['datasets'].forEach((datasetConfig) => {
            let datasetMapper = new DatasetMapper(datasetConfig);
            this.datasetMappers.push(datasetMapper);
        });
    }

    /**
     *  load relevant files from filesystem and map them using the config. nb. this will not work with azure
     *  @param {Object.<string,Buffer|Buffer[]>} source_data. An array of byte streams to import for each dataset. The key is the ID of the dataset.
     *  @return {Array}
     */
    generate(source_data) {
        var output_data;
        try {
            var issues = [];
            var datasets = [];
            this.datasetMappers.forEach((dataset_mapper) => {
                const dataset_output = dataset_mapper.generate(source_data[dataset_mapper.config.id]);
                datasets.push(dataset_output);

                // turn any issues into errors
                if (dataset_output.unmapped_headings.length > 0) {
                    issues.push("Dataset " + dataset_mapper.config.id + " has the following unexpected headings: "
                        + dataset_output.unmapped_headings.join(", "));
                }
                if (dataset_output.missing_headings.length > 0) {
                    issues.push("Dataset " + dataset_mapper.config.id + " has the following headings expected but missing from all data sources: "
                        + dataset_output.missing_headings.join(", "));
                }
            });
            if (issues.length) {
                output_data = {
                    "status": "ERROR",
                    "errors": issues
                };
            } else {
                output_data = {
                    "status": "OK",
                    "datasets": datasets
                };
            }
        } catch (error) {
            output_data = {
                "status": "ERROR",
                "errors": [error.toString()]
            };
            // Give full details to STDERR
            console.error(error);
        }
        return output_data;
    }

}

export {SiteMapper};
