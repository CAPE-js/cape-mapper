import { parse } from 'csv-parse/sync'
import xlsx from 'node-xlsx'
import { FormatError } from './FormatError.js'

class BufferToTable {
  /**
   * Convert incoming data into a two dimensional tabular format. Currently will handle CSV & XLSX.
   * @param {string} format
   * @param {number} byteStream
   * @return {Array.<Array.<string|integer>>}
   * @throws {FormatError}
   */
  static convert (format, byteStream) {
    let table = null

    switch (format) {
      case 'csv':
        table = BufferToTable.convert_csv(byteStream)
        break
      case 'xlsx':
        table = BufferToTable.convert_xlsx(byteStream)
        break
      default:
        throw new FormatError('Unsupported tabular format: ' + format)
    }

    return table
  }

  static convert_xlsx (byteStream) {
    const workbook = xlsx.parse(byteStream)
    return workbook[0].data
  }

  static convert_csv (byteStream) {
    return parse(byteStream, {
      skip_empty_lines: true
    })
  }
}

export { BufferToTable }
