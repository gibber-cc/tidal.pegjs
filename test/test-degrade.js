/* test-degrade.js
 *
 * A test for degrading groups.
 *
 */

const assert = require( 'assert')
const parser = require('../dist/tidal.js')
const queryArc = require( '../src/queryArc.js' ).queryArc
const Fraction = require( 'fraction.js' )
const util     = require( 'util' )

describe( 'Testing degradation.', () => {
  it( 'should degrade a number when followed by a question mark.', () => {

    const expected = {
      type: 'degrade',
      value: {type: 'number', value: 0}
    }

    const result = parser.parse( '0?' )

    assert.deepEqual( expected, result )
  })


  it( 'should degrade distinct numbers in pattern when followed by a question mark.', () => {
    const expected = {
      type:'group',
      values:[
        {
          type:'degrade',
          value:{ type:'number', value:1 }
        },
        { 
          type:'degrade',
          value:{ type:'number', value:2 }
        },
        {
          type:'degrade',
          value:{ type:'number', value:3 }
        }
      ],
    }

    const result = parser.parse( '1? 2? 3?' )

    assert.deepEqual( expected, result )
  })

  // given that degrade is stochastic, there is no 100% surefire way to test it. Here we test 100
  // times to ensure that it returns a value and that it fails to return a value (degraded)
  it( 'given 100 tries, a degraded value will both appear and not appear at least once.', () => {
    let foundNonDegraded = false
    let foundDegraded = false

    for( let i = 0; i < 100; i++ ) {
      const result = parser.parse( '0?' ),
             event = queryArc( result, Fraction(0), Fraction(1) )
      
      if( event.length > 0 ) {
        foundDegraded = true
      }else{
        foundNonDegraded = true
      }
    }

    assert( foundNonDegraded === true && foundDegraded === true )
  })

})
