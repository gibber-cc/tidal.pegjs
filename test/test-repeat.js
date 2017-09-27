/* test-repeat.js
 *
 * A tests for repeats in Tidal.
 *
 */

const peg    = require( 'pegjs' )
const fs     = require( 'fs' )
const assert = require( 'assert')

const grammar = fs.readFileSync( __dirname + '/../tidal.pegjs', { encoding:'utf-8' }) 
const parser  = peg.generate( grammar )

describe( 'Testing repeats.', () => { 
  /*
   * "0*2"
   *
   * ->
   *
   *  [
   *    {
   *      type:'repeat',
   *      value:{ type:'number', value:0 },
   *      mod:'*', 
   *      repeatValue:{ type:'number', value:2 },
   *    } 
   *    type:'pattern'
   *  ]
   *
   */

  it( 'should generate a 2x repeat on a number', () => {
    const pattern = [
      { 
        type:'repeat',
        value: { type:'number', value:0 },
        op: '*',
        repeatValue:{ type:'number', value:2 },
      }
    ]
    pattern.type  = 'pattern'

    const result = parser.parse( '0*2' )

    assert.deepEqual( pattern, result )
  })

  /*
   * "[0 1]*2"
   *
   * ->
   *
   *  [
   *    {
   *      type:'repeat',
   *      value:[
   *        { type:'number', value:0 },
   *        { type:'number', value:1 },
   *        type:'group'
   *      ],
   *      mod:'*', 
   *      repeatValue:{ type:'number', value:2 },
   *    } 
   *    type:'pattern'
   *  ]
   *
   */

  it( 'should generate a 2x repeat on a number', () => {
    const pattern = [
      { 
        type:'repeat',
        value: [
          { type:'number', value:0 },
          { type:'number', value:1 },
        ],
        op: '*',
        repeatValue:{ type:'number', value:2 },
      }
    ]
    pattern[0].value.type = 'group'
    pattern.type  = 'pattern'

    const result = parser.parse( '[0 1]*2' )

    assert.deepEqual( pattern, result )
  })
})
