/* test-groupgroup.js
 *
 * A test of group groups.
 *
 */

const peg    = require( 'pegjs' )
const fs     = require( 'fs' )
const assert = require( 'assert')

const grammar = fs.readFileSync( __dirname + '/../tidal.pegjs', { encoding:'utf-8' })
const parser  = peg.generate( grammar )

describe( 'Testing group groups and nested group groups.', () => {

  it( 'Array brackets [] should return an array marked as a group.', () => {

    const expected = {
      '0': {type: 'number', value: 0},
      '1/3': {type: 'number', value: 1},
      '2/3': {type: 'number', value: 2},
      type: 'group'
    }

    const result = parser.parse( '[ 0 1 2 ]' )

    assert.deepEqual( expected, result )
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

    assert.deepEqual( expected, result )


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

    assert.deepEqual( expected, result )

  })




  /*
    '0 1 2 . 3 4' ->
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
  */

  // it( '"Marking flattened feet" should divide groups into groups.', () => {
  //   const expected =
  //   {
  //     '0': {
  //       '0': {type: 'number', value: 0},
  //       '1/3': {type: 'number', value: 1},
  //       '2/3': {type: 'number', value: 2},
  //       type: 'group'
  //     },
  //     '1/2': {
  //       '0': {type: 'number', value: 3},
  //       '1/2': {type: 'number', value: 4},
  //       type: 'group'
  //     },
  //     type: 'group'
  //   }
  //
  //   const result = parser.parse( '0 1 2 . 3 4' )
  //
  //   assert.deepEqual( expected, result )
  // })
})
