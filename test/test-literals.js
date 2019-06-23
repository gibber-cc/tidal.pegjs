/* test-literals.js
 *
 * A test of parsing literals.
 *
 */

const assert   = require( 'assert')
const parser   = require('../dist/tidal.js')
const queryArc = require( '../src/queryArc.js' ).queryArc
const Fraction = require( 'fraction.js' )
const util     = require( 'util' )

const loc = ( c1, c2 ) => ({
  start:{
    offset:c1,
    line:1,
    column:c1 + 1
  },
  end:{
    offset:c2,
    line:1,
    column:c2 + 1
  }
})

describe( 'Testing parsing literals.', () => {
  it ('"0" should parse to a number.', () => {
    const expected = { type: 'number', value: 0, location:loc(0,1) }

    const result = parser.parse( '0', { addLocations:true } )

    assert.deepEqual( result, expected )
  })
 
  it ('"10" should parse to a number.', () => {
    const expected = { type: 'number', value: 10 }

    const result = parser.parse( '10' ) 

    assert.deepEqual( result, expected )
  })
 
  it ('"0 1" should parse to two numbers.', () => {
    const expected = {
      type:'group',
      values:[
        { type: 'number', value: 0, location:loc(0,1) },
        { type: 'number', value: 1, location:loc(2,3) }
      ],
      location:loc(0,3)
    }

    const result = parser.parse( '0 1', { addLocations:true } )

    //console.log( '\n\nexpected:', util.inspect( expected, { depth:4 }), '\n\n' )
    //console.log( 'result:', util.inspect( result, { depth:4 }) )
    assert.deepEqual( result, expected )
  })
  
  it ('"a" should parse to a string.', () => {
    const expected = { type: 'string', value: 'a' }

    const result = parser.parse( 'a' )

    assert.deepEqual( expected, result )
  })

  // single digit
  it ('"0" should parse to a number.', () => {
    const expected = { type: 'number', value: '0' }

    const result = parser.parse( '0' )

    assert.deepEqual( expected, result )
  })

  // testing multiple digits in one number
  it ('"100" should parse to a number.', () => {
    const expected = { type: 'number', value: '100' }

    const result = parser.parse( '100' )

    assert.deepEqual( expected, result )
  })

  // multiple letters in one word
  it( `"kd" should parse as one literal.`, () => {
    const expected = { type: 'string', value: 'kd' }

    const result = parser.parse( 'kd' )

    assert.deepEqual( result, expected )
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

  it( `"0" should schedule as two events over two cycles.`, () => {
    const expected = [{
      value:0,
      arc: { start: Fraction(0), end:Fraction(1) }
    },{
      value:0,
      arc: { start: Fraction(1), end:Fraction(2) }
    }]
    
    const pattern = parser.parse('0')

    assert.deepEqual( 
      queryArc( pattern, Fraction(0), Fraction(2) ), 
      expected
    )
  })

  it( `"0 1" should schedule as two events over one cycle.`, () => {
    const expected = [{
      value:0,
      arc: { start: Fraction(0), end:Fraction(1,2) }
    },{
      value:1,
      arc: { start: Fraction(1,2), end:Fraction(1) }
    }]
    
    const pattern = parser.parse('0 1')

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

    it( `"x o" should schedule as two events, at times 0 and 1/2..`, () => {
    const expected = [
      {
        value:'x',
        arc: { start: Fraction(0), end:Fraction(1,2) }
      },
      {
        value:'o',
        arc: { start: Fraction(1,2), end:Fraction(1) }
      }
    ]
    
    const pattern = parser.parse('x o')

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
