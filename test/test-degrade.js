/* test-degrade.js
 *
 * A test for degrading groups.
 *
 */

const peg    = require( 'pegjs' )
const fs     = require( 'fs' )
const assert = require( 'assert')

const grammar = fs.readFileSync( __dirname + '/../src/tidal.pegjs', { encoding:'utf-8' })
const parser  = peg.generate( grammar )

describe( 'Testing degradation.', () => {

  it( 'should degrade a number when followed by a question mark.', () => {

    const expected = {
      '0': {
        type: 'degrade',
        value: {type: 'number', value: 0}
      },
      type: 'group'
    }

    const result = parser.parse( '0?' )

    assert.deepEqual( expected, result )
  });


    it( 'should degrade distinct numbers in pattern when followed by a question mark.', () => {
      const expected = {
        '0': {
          type:'degrade',
          value:{ type:'number', value:1 }
        },
        '1/3': {
          type:'degrade',
          value:{ type:'number', value:2 }
        },
        '2/3': {
          type:'degrade',
          value:{ type:'number', value:3 }
        },
        type: 'group'
      }

      const result = parser.parse( '1? 2? 3?' )

      assert.deepEqual( expected, result )
    });

})
