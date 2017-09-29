/* test-patterngroup.js
 *
 * A test of pattern groups. 
 *
 */

const peg    = require( 'pegjs' )
const fs     = require( 'fs' )
const assert = require( 'assert')

const grammar = fs.readFileSync( __dirname + '/../tidal.pegjs', { encoding:'utf-8' }) 
const parser  = peg.generate( grammar )

describe( 'Testing pattern groups and nested pattern groups.', () => { 

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
   *   type:'pattern'
   * ]
   *
   */

  it( 'Array brackets [] should return an array marked as a pattern.', () => {
    const group = [
      { type:'number', value: 0 },
      { type:'number', value: 1 },
      { type:'number', value: 2 },
    ]
    group.type  = 'pattern'

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
   *   type:'pattern'
   * ]
   *
   */

  it( 'Nested brackets should return nested patterns.', () => {
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
    ].map( v => { v.type = 'pattern'; return v } )

    nestedGroup.type = 'pattern'

    const pattern = [ { type:'number', value:0 }, nestedGroup, { type:'number', value:5 } ]
    pattern.type = 'pattern'

    const result = parser.parse( '0 [[ 0 1 2 ] [ 3 4 ]] 5' )

    assert.deepEqual( pattern, result )
  })

  it( '"Marking out feet" should divide patterns into groups.', () => {
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
    ].map( v => { v.type = 'pattern'; return v } )

    groups.type = 'pattern'

    const pattern = [ groups ]
    pattern.type = 'pattern'

    const result = parser.parse( '0 1 2 . 3 4' )

    assert.deepEqual( pattern, result )
  })
})
