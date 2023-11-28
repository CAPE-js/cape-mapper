'use strict'

/*
This is a command line tool to test the cape mapper is working.
It's generally intended to usually be used via an Azure pipeline.

Usage:
node cape-map.js <config.json> <dataset1> (<dataset2> ...)
*/

import {readFileSync} from "fs"
import {MapperFactory} from "./CommandLine/MapperFactory";
import {SiteData} from "./CapeMapper/Types/Data/SiteData";

type CommandOptions = {
    jsonPath: string
    tabularDataPaths: string[]
}

const mapperFactory = new MapperFactory();

const options: CommandOptions = argsToOptions(process.argv)
const outputData = generateOutputData(options)

// Pretty print the site JSON file to STDOUT with a \n on the end
const outputString = JSON.stringify(outputData, null, 4)
console.log(outputString)
process.exit(0); // exit with good vibes

// Work out the options and quit with an error if they are invalid
function argsToOptions(args: string[]): CommandOptions {
    if (args.length < 4 || typeof args[3] != 'string') {
        throw new Error('cape-mapper expects at least two arguments')
    }
    // 0    1      2    3    4..
    // node cmd.js json ds1 [ds2...]
    const jsonPath = args[2]
    const tabularDataPaths = args.slice(3)
    return {jsonPath, tabularDataPaths}
}

function generateOutputData(opts: CommandOptions) :SiteData  {
    let outputData;
    try {
        outputData = loadFilesAndGenerateData(opts)
    } catch (error) {
        let msg: string = "Unknown";
        if (error instanceof Error) {
            msg = error.message;
        }
        outputData = {
            status: 'ERROR',
            errors: [msg]
        }

        // Give full details to STDERR
        console.error(msg)
    }
    return outputData;
}

function loadFilesAndGenerateData(opts: CommandOptions) {
    const rawData = readFileSync(opts.jsonPath).toString()
    const config = JSON.parse(rawData)

    // at this stage we open the files as buffers to pass them to the generate function
    // which will check they actually contain what we expect. The only errors caught at
    // this level is failing to open them.
    const tabularDatasets: Buffer[] = []
    opts.tabularDataPaths.forEach((filename: string) => {
        const buffer = readFileSync(filename) as Buffer
        tabularDatasets.push(buffer)
    })

    // the config allows multiple datasets, but this tool only supports one.
    if (config.datasets.length > 1) {
        throw new Error('cape-mapper only supports exactly one dataset')
    }

    // In azure functions, this function is what is called:
    const mapper = mapperFactory.getMapper(config)
    const outputData = mapper.generate(tabularDatasets)
    return outputData;
}




