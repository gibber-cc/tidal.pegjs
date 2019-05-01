/* test-groupgroup.js
 *
 * A test of group groups.
 *
 */

const assert = require( 'assert')
const parser = require('../dist/tidal.js')

describe( 'Testing group groups and nested group groups.', () => {


  it( 'Array brackets [] should return an array marked as a group.', () => {

    const expected = {
      '0': {type: 'number', value: 0},
      '1/3': {type: 'number', value: 1},
      '2/3': {type: 'number', value: 2},
      type: 'group'
    }

    const result = parser.parse( '[ 0 1 2 ]' )

    assert.deepEqual( result, expected )
  })


  it( 'Nested brackets should return nested groups.', () => {
    const expected =
    {
      '0': {type: 'number', value: 0},
      '1/3': {
        '0': {type: 'number', value: 1},
        '1/3': {type: 'number', value: 2},
        '2/3': {type: 'number', value: 3},
        type: 'group'
      },
      '2/3': {type: 'number', value: 4},
      type: 'group'
    }

    const result = parser.parse( '0 [1 2 3] 4' )

    assert.deepEqual( result, expected )


  })


  it( 'Nested brackets should return nested groups.', () => {
    const expected =
    {
      '0': {type: 'number', value: 0},
      '1/3': {
        '0': {
          '0': {type: 'number', value: 0},
          '1/3': {type: 'number', value: 1},
          '2/3': {type: 'number', value: 2},
          type: 'group'
        },
        '1/2': {
          '0': {type: 'number', value: 3},
          '1/2': {type: 'number', value: 4},
          type: 'group'
        },
        type: 'group'
      },
      '2/3': {type: 'number', value: 5},
      type: 'group'
    }

    const result = parser.parse( '0 [[ 0 1 2 ] [ 3 4 ]] 5' )

    assert.deepEqual( result, expected )

  })


  it( "Marking flattened feet with '.' should divide groups into groups.", () => {
    const expected =
    {
      '0': {
        '0': {type: 'number', value: 0},
        '1/3': {type: 'number', value: 1},
        '2/3': {type: 'number', value: 2},
        type: 'group'
      },
      '1/2': {
        '0': {type: 'number', value: 3},
        '1/2': {type: 'number', value: 4},
        type: 'group'
      },
      type: 'group'
    }

    const result = parser.parse( '0 1 2 . 3 4' )[0] //TODO: fix this indexing

    assert.deepEqual( result, expected )
  })
})
