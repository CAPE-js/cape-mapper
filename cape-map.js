'use strict'

/*
This is a command line tool to test the cape mapper is working.
It's generally intended to usually be used via a Azure pipeline.

Usage:
node cape-map.js <config.json> <dataset1> (<dataset2> ...)
*/

import { readFileSync } from 'fs'
import { SiteMapper } from './lib/CapeMapper/SiteMapper.js'

let outputData
try {
  const args = process.argv

  args.shift() // node
  args.shift() // this script
  if (args.length < 2) {
    throw new Error('cape-mapper expects at least two arguments')
  }
  const jsonConfigFile = args.shift()
  const tabularFiles = args

  const rawData = readFileSync(jsonConfigFile).toString()
  const config = JSON.parse(rawData)

  // at this stage we open the files as buffers to pass them to the generate function
  // which will check they actually contain what we expect. The only errors caught at
  // this level is failing to open them.
  const tabularDatasets = []
  tabularFiles.forEach((filename) => {
    const buffer = readFileSync(filename)
    tabularDatasets.push(buffer)
  })

  // the config allows multiple datasets, but this tool only supports one.
  if (config.datasets.length > 1) {
    throw new Error('cape-mapper only supports exactly one dataset')
  }
  const mapper = new SiteMapper(config)
  const firstDatasetId = config.datasets[0].id
  const siteDatasets = {}
  siteDatasets[firstDatasetId] = tabularDatasets

  // In azure functions, this function is what is called:
  outputData = mapper.generate(siteDatasets)
} catch (error) {
  outputData = {
    status: 'ERROR',
    errors: [error.toString()]
  }
  // Give full details to STDERR
  console.error(error)
}

// Pretty print the site JSON file to STDOUT
const outputString = JSON.stringify(outputData, null, 4)
console.log(outputString)
