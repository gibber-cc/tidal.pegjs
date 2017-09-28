/* test-bjorklund.js
 *
 * A test for matching Euclidean rhythms in the Tidal DSL 
 *
 */

const peg    = require( 'pegjs' )
const fs     = require( 'fs' )
const assert = require( 'assert')

const grammar = fs.readFileSync( __dirname + '/../tidal.pegjs', { encoding:'utf-8' }) 
const parser  = peg.generate( grammar )

describe( 'Testing Euclidean rhythms.', () => { 
  /*
   * "60( 3,8 )
   *
   * ->
   *
   *  [
   *    {
   *      type:'euclid',
   *      value: { type:'number', value:60 },
   *      pulses:{ type:'number', value:3 },
   *      slots: { type:'number', value:8 }
   *    },
   *    type:'pattern'
   *  ]
   *
   */

  it( 'should generate a euclidean rhythm', () => {
    const pattern = [
      {
        value: { type:'number', value:60 },
        pulses:{ type:'number', value:3  },
        slots: { type:'number', value:8  },
        type:  'euclid'
      }
    ]
    pattern.type  = 'pattern'

    const result = parser.parse( '60( 3,8 )' )

    assert.deepEqual( pattern, result )
  })

})
