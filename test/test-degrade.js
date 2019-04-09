/* test-degrade.js
 *
 * A test for degrading groups.
 *
 */

const peg    = require( 'pegjs' )
const fs     = require( 'fs' )
const assert = require( 'assert')

const grammar = fs.readFileSync( __dirname + '/../tidal.pegjs', { encoding:'utf-8' })
const parser  = peg.generate( grammar )

describe( 'Testing degradation.', () => {
  /*
   * "0?"
   *
   * ->
   *
   *  [
   *    { type:'degrade',
   *      value:{ type:'number', value:0 }
   *    },
   *    type:'group'
   *  ]
   *
   */

  it( 'should degrade a number when followed by a question mark.', () => {
    const group = [
      {
        type:'degrade',
        value:{ type:'number', value:0 }
      }
    ]
    group.type  = 'group'

    const result = parser.parse( '0?' )

    assert.deepEqual( group, result )
  })

})
