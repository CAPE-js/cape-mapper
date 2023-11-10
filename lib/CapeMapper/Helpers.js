class Helpers {
  /**
   * If the value is not an array, wrap it in an array
   * @param {any} value
   * @return {[]}
   */
  static ensureArray (value) {
    if (Array.isArray(value)) {
      return value
    }
    return [value]
  }

  /**
   * @param {Array<Array<any>>} table
   * @return {Array<Object<string,any>>}
   */
  static tableToRecords (table) {
    // convert tabular data to records
    const records = []
    for (let i = 1; i < table.length; ++i) {
      const record = {}
      // iterate over headings in first row
      for (let j = 0; j < table[0].length; ++j) {
        // we might get some headings at the end that are undefined...
        // skip those columns
        if (table[0][j] !== undefined) {
          record[table[0][j].trim()] = table[i][j]
        }
      }
      records.push(record)
    }
    return records
  }
}

export { Helpers }
