/*
  test-polymeter.js

  A test for polymeters.

  From https://tidalcycles.org/index.php/Tutorial:
  "A polymeter pattern is one where two patterns have different sequence lengths,
  but share the same pulse or tempo.
  You use curly brace syntax to create a polymeter rhythm:

  d1 $ sound "{bd hh sn cp, arpy bass2 drum notes can}"

  The code above results in a five-note rhythm being played at
  the pulse of a four-note rhythm. If you switch the groups around,
  it results in a four-note rhythm over a five-note rhythm:

  d1 $ sound "{arpy bass2 drum notes can, bd hh sn cp}""
*/

const assert = require( 'assert')
const parser = require('../dist/tidal.js')
const queryArc = require( '../queryArc.js' )
const Fraction = require( 'fraction.js' )

const util     = require( 'util' )

describe('Testing polymeters', () => {

  it('{0,1 2} should parse as a polymeter', () => {

    const expected = {
      left: {
        '0': {type: 'number', value: 1},
        '1/4': {type: 'number', value: 2},
        '1/2': {type: 'number', value: 3},
        '3/4': {type: 'number', value: 4},
        type: 'group'
      },
      right: {
        '0': {type: 'number', value: 1},
        '1/5': {type: 'number', value: 2},
        '2/5': {type: 'number', value: 3},
        '3/5': {type: 'number', value: 4},
        '4/5': {type: 'number', value: 5},
        type: 'group'
      },
      type: 'polymeter'
    }

    const result = parser.parse('{0,1 2}')

    assert(result.type === 'polymeter')

  })

  it( `{0 1, 2 3 4} should parse as polymeter and schedule correctly over two cycles.`, () => {
    // must be left pattern first, right pattern second, but broken up by cycle.
    // so left (cycle1), right(cycle1), left( cycle2), right(cycle2)
    const expected = [
      {
        value:0,
        arc: { start: Fraction(0), end:Fraction(1,2) }
      },
      {
        value:1,
        arc: { start: Fraction(1,2), end:Fraction(1) }
      },
      {
        value:2,
        arc: { start: Fraction(0), end:Fraction(1,2) }
      },
      {
        value:3,
        arc: { start: Fraction(1,2), end:Fraction(1) }
      },
      {
        value:0,
        arc: { start: Fraction(1), end:Fraction(3,2) }
      },
      {
        value:1,
        arc: { start: Fraction(3,2), end:Fraction(2) }
      },
      {
        value:4,
        arc: { start: Fraction(1), end:Fraction(3,2) }
      },

      {
        value:2,
        arc: { start: Fraction(3,2), end:Fraction(2) }
      }
    ]
    
    const pattern = parser.parse('{0 1, 2 3 4}')

    assert.deepEqual( 
      queryArc( pattern, Fraction(0), Fraction(2) ), 
      expected 
    )
  })
})
//events = queryArc( 
//  { 
//    type:'polymeter', 
//    left: { type:'group', values:[{ type:'number', value:0 },{ type:'number', value:1 }] }, 
//    right:{ type:'group', values:[{ type:'number', value:2 },{ type:'number', value:3 }, { type:'number', value:4 }] } 
//  },
//  Fraction(0), Fraction(2) 
//)
