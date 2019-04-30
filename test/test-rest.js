/* test-rest.js
 *
 * A test for rests in Tidal
 *
 */

const peg    = require( 'pegjs' )
const fs     = require( 'fs' )
const assert = require( 'assert')

const grammar = fs.readFileSync( __dirname + '/../src/tidal.pegjs', { encoding:'utf-8' })
const parser  = peg.generate( grammar )

describe( 'Testing rests.', () => {


  it( 'should generate a rest object when parsing a ~', () => {
    const expected = {
      '0': { type:'number', value:0 },
      '1/4': { type:'rest' },
      '1/2': { type:'number', value:2 },
      '3/4': { type:'rest' },
    }
    expected.type  = 'group'

    const result = parser.parse( '0 ~ 2 ~' )

    assert.deepEqual( result, expected )
  })

})
