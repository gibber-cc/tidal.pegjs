/* test-bjorklund.js
 *
 * A test for matching Euclidean rhythms in the Tidal DSL
 *
 */

const assert = require( 'assert')
const parser = require('../dist/tidal.js')
const queryArc = require( '../src/queryArc.js' ).queryArc
const Fraction = require( 'fraction.js' )
const util     = require( 'util' )

describe( 'Testing Euclidean rhythms.', () => {

  it( 'should generate a euclidean rhythm', () => {
    const expected = {
      value: { type:'number', value:60 },
      pulses:{ type:'number', value:3  },
      slots: { type:'number', value:8  },
      rotation: null,
      type:  'bjorklund'
    }

    const result = parser.parse( '60(3,8)' )

    assert.deepEqual( result, expected )
  })


  it( 'should generate a euclidean rhythm with a group determining pulses', () => {
    const group ={
      value: { type:'number', value:60 },
      pulses:{
        type:'group',
        values:[
          { type:'number', value:3 },
          { type:'number', value:5 }
        ]
      },
      slots: { type:'number', value:8  },
      rotation: null,
      type: 'bjorklund'
    }

    const result = parser.parse( '60( [3 5],8 )' )

    assert.deepEqual( group, result )
  })


  it( 'should generate a euclidean rhythm with a rotation', () => {
    const group ={
      value:  { type:'number', value:60 },
      pulses: { type:'number', value:5 },
      slots:  { type:'number', value:8  },
      rotation: {type: 'number', value:2},
      type:  'bjorklund'
    }

    const result = parser.parse( '60( 5,8,2 )' )

    assert.deepEqual( group, result )
  })

  it( `"0(1,2)" should schedule as one event, from 0 and 1/2`, () => {
    const expected = [
      {
        value:{ type:'number', value:0 },
        arc: { start: Fraction(0), end:Fraction(1,2) }
      }
    ]
    
    const pattern = parser.parse('0(1,2)')

    assert.deepEqual( 
      expected, 
      queryArc( pattern, Fraction(0), Fraction(1) ) 
    )
  })

  it( `"0(2,2)" should schedule as two events.`, () => {
    const expected = [
      {
        value:{ type:'number', value:0 },
        arc: { start: Fraction(0), end:Fraction(1,2) }
      },
      {
        value:{ type:'number', value:0 },
        arc: { start: Fraction(1,2), end:Fraction(1) }
      }
    ]
    
    const pattern = parser.parse('0(2,2)')

    assert.deepEqual( 
      expected, 
      queryArc( pattern, Fraction(0), Fraction(1) ) 
    )
  })

  it( `"0(2,4)" should schedule as two events with duration 1/4.`, () => {
    const expected = [
      {
        value:{ type:'number', value:0 },
        arc: { start: Fraction(0), end:Fraction(1,4) }
      },
      {
        value:{ type:'number', value:0 },
        arc: { start: Fraction(1,2), end:Fraction(3,4) }
      }
    ]
    
    const pattern = parser.parse('0(2,4)')

    assert.deepEqual( 
      expected, 
      queryArc( pattern, Fraction(0), Fraction(1) ) 
    )
  })
})
