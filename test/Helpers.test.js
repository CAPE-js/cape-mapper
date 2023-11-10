import { describe, expect, test } from 'vitest'
import { Helpers } from '../lib/CapeMapper/Helpers.js'

describe('Helpers', () => {
  describe('ensureArray()', () => {
    test('When passed an array: return the array unchanged', () => {
      expect(Helpers.ensureArray([1, 2, 3])).toStrictEqual([1, 2, 3])
    })

    test('When passed a non array: return it wrapped in an array', () => {
      expect(Helpers.ensureArray(242)).toStrictEqual([242])
    })
  })

  describe('tableToRecords()', () => {
    test('When passed a table representing a spreadsheet: Return an array of objects representing the rows as records based on  headings in the first line', () => {
      const records = Helpers.tableToRecords([
        ['Title', 'Year'],
        ['Alpha', '1980'],
        ['Beta', '1992']
      ])
      expect(records).toEqual([{ Title: 'Alpha', Year: '1980' }, { Title: 'Beta', Year: '1992' }])
    })
  })
})
