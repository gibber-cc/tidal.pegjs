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

  /*
   * "[ 0 1 2 ]" ->
   *
   * [
   *   [
   *     { type:'number', value: 0 },
   *     { type:'number', value: 1 },
   *     { type:'number', value: 2 },
   *     type:'group'
   *   ]
   *   type:'group'
   * ]
   *
   */

  it( 'Array brackets [] should return an array marked as a group.', () => {
    const group = [
      { type:'number', value: 0 },
      { type:'number', value: 1 },
      { type:'number', value: 2 },
    ]
    group.type  = 'group'

    const result = parser.parse( '[ 0 1 2 ]' )

    assert.deepEqual( group, result )
  })

  /*
   * "0 [[ 0 1 2] [ 3 4 ]] 5" ->
   *
   * [
   *   0,
   *   [
   *     [ 0,1,2, type:'group' ],
   *     [ 3,4,   type:'group' ],
   *     type:'group'
   *   ],
   *   5,
   *   type:'group'
   * ]
   *
   */

  it( 'Nested brackets should return nested groups.', () => {
    const nestedGroup = [
      [
        { type:'number', value:0 },
        { type:'number', value:1 },
        { type:'number', value:2 },
      ],
      [
        { type:'number', value:3 },
        { type:'number', value:4 }
      ]
    ].map( v => { v.type = 'group'; return v } )

    nestedGroup.type = 'group'

    const group = [ { type:'number', value:0 }, nestedGroup, { type:'number', value:5 } ]
    group.type = 'group'

    const result = parser.parse( '0 [[ 0 1 2 ] [ 3 4 ]] 5' )

    assert.deepEqual( group, result )
  })

  it( '"Marking out feet" should divide groups into groups.', () => {
    const groups = [
      [
        { type:'number', value:0 },
        { type:'number', value:1 },
        { type:'number', value:2 },
      ],
      [
        { type:'number', value:3 },
        { type:'number', value:4 }
      ]
    ].map( v => { v.type = 'group'; return v } )

    groups.type = 'group'

    const group = [ groups ]
    group.type = 'group'

    const result = parser.parse( '0 1 2 . 3 4' )

    assert.deepEqual( group, result )
  })
})
