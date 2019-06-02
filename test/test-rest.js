/* test-rest.js
 *
 * A test for rests in Tidal
 *
 */

const assert = require( 'assert')
const parser = require('../dist/tidal.js')

describe( 'Testing rests.', () => {

  it( 'should generate a rest object when parsing a ~', () => {
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

})
