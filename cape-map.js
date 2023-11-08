'use strict';

/*
This is a command line tool to test the cape mapper is working.
It's generally intended to usually be used via a Azure pipeline.

Usage:
node cape-map.js <config.json> <dataset1> (<dataset2> ...)
*/

import { readFileSync } from 'fs';
import { SiteMapper } from "./lib/CapeMapper/SiteMapper.js";

var output_data;
try { 
    let args = process.argv;

    args.shift(); // node
    args.shift(); // this script
    if( args.length < 2 ) {
        throw new Error( "cape-mapper expects at least two arguments" );
    }
    const json_config_file = args.shift();
    const tabular_files = args;
    
    const rawData = readFileSync(json_config_file).toString();
    let config = JSON.parse(rawData);

    // at this stage we open the files as buffers to pass them to the generate function
    // which will check they actually contain what we expect. The only errors caught at
    // this level is failing to open them.
    let tabular_datasets = [];
    tabular_files.forEach((filename) => {
        let buffer = readFileSync(filename);
        tabular_datasets.push(buffer);
    })


    // the config allows multiple datasets, but this tool only supports one.
    if( config['datasets'].length > 1 ) {
        throw new Error( "cape-mapper only supports exactly one dataset" );
    }
    let mapper = new SiteMapper(config);
    const first_dataset_id = config['datasets'][0]['id'];
    let site_datasets = {};
    site_datasets[first_dataset_id] = tabular_datasets;

    // In azure functions, this function is what is called:
    output_data = mapper.generate(site_datasets);
}
catch( error ) {
    output_data = {
      "status": "ERROR",
      "errors": [ error.toString() ]
    };
    // Give full details to STDERR
    console.error( error );
}

// Pretty print the site JSON file to STDOUT
const output_string = JSON.stringify( output_data, null, 4 );
console.log(output_string);
