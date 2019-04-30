/* test-repeat.js
 *
 * A tests for repeats in Tidal.
 *
 */

const peg    = require( 'pegjs' )
const fs     = require( 'fs' )
const assert = require( 'assert')

const grammar = fs.readFileSync( __dirname + '/../src/tidal.pegjs', { encoding:'utf-8' })
const parser  = peg.generate( grammar )

describe( "Testing repeats with '*'", () => {


  it( 'should generate a 2x repeat on a number.', () => {

    const expected = {
      type: 'repeat',
      operator:'*',
      repeatValue: { type: 'number', value: 2 },
      value: { type:'number', value:0 }
    }

    const result = parser.parse( '0*2' )

    assert.deepEqual(result, expected)

  });


  it( 'should generate a 2x repeat on a group pattern', () => {
    const expected = {
      type:'repeat',
      operator: '*',
      repeatValue:{ type:'number', value:2 },
      value: {
        '0': { type:'number', value:2 },
        '1/2': { type:'number', value:1 },
        type: 'group'
      },
    }

    const result = parser.parse( '[2 1]*2' )

    assert.deepEqual( result, expected )

  });

})
