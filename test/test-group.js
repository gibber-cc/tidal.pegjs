/* test-group.js
 *
 * A test of simple number series as groups.
 *
 */

const peg    = require( 'pegjs' )
const fs     = require( 'fs' )
const assert = require( 'assert')

const grammar = fs.readFileSync( __dirname + '/../tidal.pegjs', { encoding:'utf-8' })
const parser  = peg.generate( grammar )

describe( 'Testing simple number series groups.', () => {

  /*
   * "0 1 2" ->
   *
   * [
   *   { type:'number', value: 0 },
   *   { type:'number', value: 1 },
   *   { type:'number', value: 2 },
   *   type:'group'
   * ]
   */

  it( '"0 1 2" should parse to an array of three numbers, marked as a group.', () => {
    const answer = [
      { type:'number', value: 0 },
      { type:'number', value: 1 },
      { type:'number', value: 2 },
    ]
    answer.type  = 'group'

    const result = parser.parse( '0 1 2' )

    assert.deepEqual( answer, result )
  })

})
