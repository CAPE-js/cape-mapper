import { describe, expect, expectTypeOf, test } from 'vitest'
import { FieldMapper } from '../lib/CapeMapper/FieldMapper.js'

describe('FieldMapper', () => {
  describe('constructor', () => {
    test('When passed a simple configuration: an object is returned', () => {
      const fieldMapper = new FieldMapper({ id: 'title', label: 'Title' })
      expectTypeOf(fieldMapper).toBeObject()
    })
    /* eslint-disable no-unused-vars */
    test('When not passed a label: an error is thrown', () => {
      expect(() => {
        const fieldMapper = new FieldMapper({ id: 'Title' })
      }).toThrowError('Fields must have label, unless they are type \'ignore\'')
    })

    test('When not passed a label on a field of type "ignore": no error is thrown', () => {
      expect(() => {
        const fieldMapper = new FieldMapper({ id: 'Title', type: 'ignore' })
      }).not.toThrowError()
    })

    test('When source_headings is a list including AUTO: throw an erorr', () => {
      expect(() => {
        const fieldMapper = new FieldMapper({ id: 'title', label: 'Title', source_headings: ['foo', 'AUTO'] })
      }).not.toThrowError()
    })
    /* eslint-enable no-unused-vars */

    test('When multiple is not set: default it to false', () => {
      const fieldMapper = new FieldMapper({ id: 'Title', label: 'Title' })
      expect(fieldMapper.config.multiple).toStrictEqual(false)
    })
  })

  describe('process_single_raw_value()', () => {
    test('When a string is processed by a string field mapper: it is returned unchanged', () => {
      const fieldMapper = new FieldMapper({ label: 'Title', type: 'string' })
      expect(fieldMapper.process_single_raw_value('foo bar')).toStrictEqual('foo bar')
    })

    test('When an integer is processed by a string field mapper: it is cast to a string', () => {
      const fieldMapper = new FieldMapper({ label: 'Title', type: 'string' })
      expect(fieldMapper.process_single_raw_value(23)).toStrictEqual('23')
    })

    test('When a string containing a number is processed by a integer field mapper: it is cast to that number', () => {
      const fieldMapper = new FieldMapper({ label: 'Year', type: 'integer' })
      expect(fieldMapper.process_single_raw_value('1976')).toStrictEqual(1976)
    })
    test('When a string not containing a number is processed by a integer field mapper: it is cast to NaN', () => {
      const fieldMapper = new FieldMapper({ label: 'Year', type: 'integer' })
      expect(fieldMapper.process_single_raw_value('foobar')).toStrictEqual(NaN)
    })
    test('When an integer is processed by a integer field mapper: it is returned unchanged', () => {
      const fieldMapper = new FieldMapper({ label: 'Year', type: 'integer' })
      expect(fieldMapper.process_single_raw_value(23)).toStrictEqual(23)
    })

    test('When an string of over 10 characters is processed by a date field mapper: it is returned truncated', () => {
      const fieldMapper = new FieldMapper({ label: 'Date', type: 'date' })
      expect(fieldMapper.process_single_raw_value('2020-12-24T23:59:59Z')).toStrictEqual('2020-12-24')
    })
  })

  // TODO generate()

  // TODO process_raw_values()

  // TODO process_single_raw_value()

  // TODO select_source_headings()
})
