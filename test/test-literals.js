/* test-literals.js
 *
 * A test of parsing literals.
 *
 */

const assert   = require( 'assert')
const parser   = require('../dist/tidal.js')
const queryArc = require( '../queryArc.js' )
const Fraction = require( 'fraction.js' )
const util     = require( 'util' )

describe( 'Testing parsing literals.', () => {

  it ('"a" should parse to a string.', () => {
    const expected = { type: 'string', value: 'a' }

    const result = parser.parse( 'a' )

    assert.deepEqual( expected, result )
  })

  it ('"0" should parse to a number.', () => {
    const expected = { type: 'number', value: '0' }

    const result = parser.parse( '0' )

    assert.deepEqual( expected, result )
  })

  it( `"0" should schedule as one event, at time 0 and with duration 1.`, () => {
    const expected = [{
      value:0,
      arc: { start: Fraction(0), end:Fraction(1) }
    }]
    
    const pattern = parser.parse('0')

    assert.deepEqual( 
      queryArc( pattern, Fraction(0), Fraction(1) ), 
      expected
    )
  })

  it( `"a" should schedule as one event, at time 0 and with duration 1.`, () => {
    const expected = [{
      value:'a',
      arc: { start: Fraction(0), end:Fraction(1) }
    }]
    
    const pattern = parser.parse('a')

    assert.deepEqual( 
      queryArc( pattern, Fraction(0), Fraction(1) ), 
      expected
    )
  })

  it( `"0" should schedule no events at phase 0 duration .25`, () => {
    const expected = []

    const pattern = parser.parse('0')

    assert.deepEqual( 
      queryArc( pattern, Fraction(.5), Fraction(.25) ), 
      expected
    )
  })
})
