/* test-rest.js
 *
 * A test for rests in Tidal
 *
 */

const assert = require( 'assert')
const parser = require('../dist/tidal.js')
const queryArc = require( '../src/queryArc.js' ).queryArc
const Fraction = require( 'fraction.js' )
const util     = require( 'util' )

describe( 'Testing rests.', () => {

  it( 'should generate rest objects when parsing "0 ~ 2 ~"', () => {
    const expected = {
      type:'group',
      values:[ 
        { type:'number', value:0 },
        { type:'rest' },
        { type:'number', value:2 },
        { type:'rest' },
      ]
    }

    const result = parser.parse( '0 ~ 2 ~' )

    assert.deepEqual( result, expected )
  })

  it( 'querying "0 ~" for one cycle should return one event', () => {
    const expected =[
      { value:0, arc:{ start:Fraction(0), end:Fraction(1,2) } }
    ]

    const pattern = parser.parse( '0 ~' )
    const result  = queryArc( pattern, Fraction(0), Fraction(1) )

    assert.deepEqual( result, expected )
  })
})
