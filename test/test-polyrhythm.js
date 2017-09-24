/* test-polyrhythm.js
 *
 * A test of polyrhythms and nested polyrhythms.
 *
 */

const peg    = require( 'pegjs' )
const fs     = require( 'fs' )
const assert = require( 'assert')

const grammar = fs.readFileSync( __dirname + '/../tidal.pegjs', { encoding:'utf-8' }) 
const parser  = peg.generate( grammar )

describe( 'Testing polyrhyhtms and nested polyrhythms.', () => { 

  /*
   * "[ 0 1 2 ]" ->
   *
   * [
   *   [ 0,1,2, type:'polyrhythm'],
   *   type:'pattern'
   * ]
   *
   */

  it( 'Array brackets [] should return an array marked as a polyrhtyhm', () => {
    const polyrhythm = [ 0, 1, 2 ]
    polyrhythm.type  = 'polyrhythm'
    
    const pattern = [ polyrhythm ]
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
   *     [ 0,1,2, type:'polyrhythm' ],
   *     [ 3,4,   type:'polyrhythm' ],
   *     type:'polyrhythm'
   *   ],
   *   5,
   *   type:'pattern'
   * ]
   *
   */

  it( 'Nested brackets should return nested polyrhythms.', () => {
    const nestedPolyrhythm = [
      [ 0, 1, 2 ],
      [ 3, 4 ]
    ].map( v => { v.type = 'polyrhythm'; return v } )

    nestedPolyrhythm.type = 'polyrhythm'

    const pattern = [ 0, nestedPolyrhythm, 5 ]
    pattern.type = 'pattern'

    const result = parser.parse( '0 [[ 0 1 2 ] [ 3 4 ]] 5' )

    assert.deepEqual( pattern, result )
  })

})
