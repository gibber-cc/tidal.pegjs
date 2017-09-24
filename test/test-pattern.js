/* test-pattern.js
 *
 * A test of simple number series as patterns.
 *
 */

const peg    = require( 'pegjs' )
const fs     = require( 'fs' )
const assert = require( 'assert')

const grammar = fs.readFileSync( __dirname + '/../tidal.pegjs', { encoding:'utf-8' }) 
const parser  = peg.generate( grammar )

describe( 'Testing simple number series patterns.', () => { 

  /*
   * "0 1 2" ->
   *
   * [ 0,1,2, type:'pattern' ]
   *
   */

  it( '"0 1 2" should parse to an array of three numbers, marked as a pattern.', () => {
    const answer = [ 0, 1, 2 ]
    answer.type  = 'pattern'

    const result = parser.parse( '0 1 2' )
      
    assert.deepEqual( answer, result )
  })

})
