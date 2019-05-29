/* test-group.js
 *
 * A test of simple number series as groups.
 *
 */

const assert   = require( 'assert')
const parser   = require('../dist/tidal.js')
const queryArc = require( '../queryArc.js' )
const Fraction = require( 'fraction.js' )
const util     = require( 'util' )

describe( 'Testing simple number series groups.', () => {

  it( '"0 1 2" should parse to an array of three numbers, marked as a group.', () => {
    const expected = {
      values: [
        { type: 'number', value: 0 },
        { type: 'number', value: 1 },
        { type: 'number', value: 2 },
      ],
      type: 'group'
    }
    const result = parser.parse( '0 1 2' )

    assert.deepEqual( expected, result )
  })


  it ('"a" should parse to an array of 1 string, marked as group.', () => {
    const expected = {
      values:[
        { type: 'string', value: 'a' },
      ],
      type: 'group'
    }

    const result = parser.parse('a')

    assert.deepEqual(expected, result)
  })

  it( `"0 1" should schedule as two events, at 0 and 1/2`, () => {
    const expected = [
      {
        value:0,
        arc: { start: Fraction(0), end:Fraction(1,2) }
      },
      {
        value:1,
        arc: { start: Fraction(1,2), end:Fraction(1) }
      }
    ]
    
    const pattern = parser.parse('0 1')

    assert.deepEqual( 
      expected, 
      queryArc( [], pattern, Fraction(0), Fraction(1) ) 
    )
  })

  it( `when starting with a phase of 1/4, "0 1" should schedule one event, at 1/2`, () => {
    const expected = [
      {
        value:1,
        arc: { start: Fraction(1,4), end:Fraction(3,4) }
      }
    ]
    
    const pattern = parser.parse('0 1')

    assert.deepEqual( 
      expected, 
      queryArc( [], pattern, Fraction(.25), Fraction(.75) ) 
    )
  })

  it( `when starting with a phase of .85 and a duration of .1, "0 1" should schedule no events`, () => {
    const expected = []
    const pattern = parser.parse('0 1')

    assert.deepEqual( 
      expected, 
      queryArc( [], pattern, Fraction(.85), Fraction(.1) ) 
    )
  })
})
