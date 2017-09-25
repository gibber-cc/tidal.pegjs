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
   *   [ 0,1,2, type:'group'],
   *   type:'pattern'
   * ]
   *
   */

  it( 'Array brackets [] should return an array marked as a group.', () => {
    const group = [ 0, 1, 2 ]
    group.type  = 'group'
    
    const pattern = [ group ]
    pattern.type  = 'pattern'

    const result = parser.parse( '[ 0 1 2 ]' )
      
    assert.deepEqual( pattern, result )
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

  it( 'Nested brackets should return nested groups.', () => {
    const nestedGroup = [
      [ 0, 1, 2 ],
      [ 3, 4 ]
    ].map( v => { v.type = 'group'; return v } )

    nestedGroup.type = 'group'

    const pattern = [ 0, nestedGroup, 5 ]
    pattern.type = 'pattern'

    const result = parser.parse( '0 [[ 0 1 2 ] [ 3 4 ]] 5' )

    assert.deepEqual( pattern, result )
  })

})
