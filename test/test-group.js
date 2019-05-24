/* test-group.js
 *
 * A test of simple number series as groups.
 *
 */

const assert = require( 'assert')
const parser = require('../dist/tidal.js')

describe( 'Testing simple number series groups.', () => {


  it( '"0 1 2" should parse to an array of three numbers, marked as a group.', () => {
    const expected = {
      values: [
        { type: 'number', value: 0 },
        { type: 'number', value: 1 },
        { type: 'number', value: 2 },
      ],
      type: 'group'
    }
    const result = parser.parse( '0 1 2' )

    assert.deepEqual( expected, result )
  })


  it ('"a" should parse to an array of 1 string, marked as group.', () => {

    const expected = {
      values:[
        { type: 'string', value: 'a' },
      ],
      type: 'group'
    }

    const result = parser.parse('a')

    assert.deepEqual(expected, result)
  })

})
