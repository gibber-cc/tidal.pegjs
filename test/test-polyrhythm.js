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

  it( 'Commas should return an pattern marked as a polyrhythm', () => {
    const polyrhythm = [ 0, 1, 2 ]
    polyrhythm.type  = 'polyrhythm'
    
    const pattern = [ polyrhythm ]
    pattern.type  = 'pattern'

    const result = parser.parse( '[ 0 1, 2 3 4 ]' )
      
    assert.deepEqual( pattern, result )
  })

})
