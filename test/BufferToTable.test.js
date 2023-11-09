import { describe, expect, test } from 'vitest'
import { BufferToTable } from '../lib/CapeMapper/BufferToTable.js'
import { readFileSync } from 'fs'

describe('BufferToTable', () => {
  describe('convert_xlsx()', () => {
    test('When called with a valid XLSX byte-stream: Returns the contents as a data structure', () => {
      const buffer = readFileSync('test/data/Test.xlsx')
      const data = BufferToTable.convert_xlsx(buffer)
      expect(data).toEqual([
        ['Title', 'Year'],
        ['Alpha', 1980],
        ['Beta', 1992]
      ])
    })
  })

  describe('convert_csv()', () => {
    test('When called with a valid CSV byte-stream: Returns the contents as a data structure', () => {
      const buffer = readFileSync('test/data/Test.csv')
      const data = BufferToTable.convert_csv(buffer)
      expect(data).toEqual([
        ['Title', 'Year'],
        ['Gamma', '1997'],
        ['Delta', '2002']
      ])
    })
  })
})
