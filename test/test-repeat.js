/* test-repeat.js
 *
 * A tests for repeats in Tidal.
 *
 */

const assert = require( 'assert')
const parser = require('../dist/tidal.js')
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

describe( "Testing repetitions.", () => {

  
  
  it( 'should generate a 2x repeat on a number.', () => {

    const expected = {
      type: 'speed',
      rate: { type: 'number', value:2, location:loc(2,3) },
      value: { type:'number', value:0, location:loc(0,1) },
      location:loc(0,3)
    }

    const result = parser.parse( '0*2', { addLocations:true } )

    //console.log( 'result:', util.inspect( result, { depth:4 } ) )
    assert.deepEqual(result, expected)
  })

  it( 'rule is not greedy.', () => {
    const result = parser.parse( '0*2 3' )

    return result !== undefined
  })

  it( 'should generate a 2x repeat on a string.', () => {

    const expected = {
      type: 'speed',
      rate: { type: 'number', value: 2 },
      value: { type:'string', value:'a' }
    }

    const result = parser.parse( 'a*2' )

    assert.deepEqual(result, expected)
  })
  it( 'should generate a 2x repeat on a multi-digit number.', () => {
    const expected = {
      type: 'speed',
      rate: { type: 'number', value:2 },
      value: { type:'number', value:100 }
    }

    const result = parser.parse( '100*2' )

    assert.deepEqual(result, expected)
  })
  it( 'should generate a 2x repeat on a multi-letter string.', () => {
    const expected = {
      type: 'speed',
      rate: { type: 'number', value:2 },
      value: { type:'string', value:'kd' }
    }

    const result = parser.parse( 'kd*2' )

    assert.deepEqual(result, expected)
  })

  it( 'should generate a 2x repeat on a group pattern', () => {
    const expected = {
      type:'speed',
      rate:{ type:'number', value:2 },
      value: {
        type:'group',
        values:[
          { type:'number', value:2 },
          { type:'number', value:1 },
        ]
      }
    }

    const result = parser.parse( '[2 1]*2' )

    assert.deepEqual( result, expected )
  })

  it( 'should generate two events given "0*2" and a duration of 1' , () => {
    const expected = [
      { value:0, arc:{ start:Fraction(0), end:Fraction(1,2) } },
      { value:0, arc:{ start:Fraction(1,2), end:Fraction(1) } }
    ]

    const pattern = parser.parse( '0*2' )
    const result = queryArc( pattern, Fraction(0), Fraction(1) )


    assert.deepEqual( result, expected )

  })
  
  
  it( 'should generate four events given "0*2" and a duration of 2' , () => {
    const expected = [
      { value:0, arc:{ start:Fraction(0), end:Fraction(1,2) } },
      { value:0, arc:{ start:Fraction(1,2), end:Fraction(1) } },
      { value:0, arc:{ start:Fraction(1), end:Fraction(3,2) } },
      { value:0, arc:{ start:Fraction(3,2), end:Fraction(2) } }
    ]

    const pattern = parser.parse( '0*2' )
    const result = queryArc( pattern, Fraction(0), Fraction(2) )

    //console.log( '\n\nresult:', util.inspect( result, { depth:4 } ), '\n\n' )
    assert.deepEqual( result, expected )
  })

  it( 'should generate one event given "0/2" and a duration of 2' , () => {
    const expected = [
      { value:0, arc:{ start:Fraction(0), end:Fraction(1) } },
    ]

    const pattern = parser.parse( '0/2' )
    const result = queryArc( pattern, Fraction(0), Fraction(2) )

    assert.deepEqual( result, expected )

  })
  // */ 
  it( 'should generate two events given "0/2" and a duration of 3' , () => {
    const expected = [
      { value:0, arc:{ start:Fraction(0), end:Fraction(1) } },
      { value:0, arc:{ start:Fraction(2), end:Fraction(3) } },
    ]

    const pattern = parser.parse( '0/2' )
    const result = queryArc( pattern, Fraction(0), Fraction(3) )

    assert.deepEqual( result, expected )

  })

  
  it( 'should generate two events given "0/4" and a duration of 8' , () => {
    const expected = [
      { value:0, arc:{ start:Fraction(0), end:Fraction(1) } },
      { value:0, arc:{ start:Fraction(4), end:Fraction(5) } },
    ]

    const pattern = parser.parse( '0/4' )
    const result = queryArc( pattern, Fraction(0), Fraction(8) )

    //console.log( 'result:', util.inspect( result, { depth:4 } ) )
    assert.deepEqual( result, expected )

  })

  
  it( 'should generate two events given "[0 1]/2" and a duration of 2' , () => {
    const expected = [
      { value:0, arc:{ start:Fraction(0), end:Fraction(1) } },
      { value:1, arc:{ start:Fraction(1), end:Fraction(2) } },
    ]

    const pattern = parser.parse( '[0 1]/2' )
    const result = queryArc( pattern, Fraction(0), Fraction(2) )

    //console.log( 'result:', util.inspect( result, { depth:4 } ) )
    assert.deepEqual( result, expected )

  })

  it( 'should generate two events given "[0 1]/2", a duration of 2, and a phase of 1' , () => {
    const expected = [
      { value:1, arc:{ start:Fraction(0), end:Fraction(1) } },
      { value:0, arc:{ start:Fraction(1), end:Fraction(2) } },
    ]

    const pattern = parser.parse( '[0 1]/2' )
    const result = queryArc( pattern, Fraction(1), Fraction(2) )

    //console.log( 'result:', util.inspect( result, { depth:4 } ) )
    assert.deepEqual( result, expected )

  })

  it( 'should generate three events given "0/2 1" and a duration of 2' , () => {
    const expected = [
      { value:0, arc:{ start:Fraction(0), end:Fraction(1,2) } },
      { value:1, arc:{ start:Fraction(1,2), end:Fraction(1) } },
      { value:1, arc:{ start:Fraction(3,2), end:Fraction(2) } },
    ]

    const pattern = parser.parse( '0/2 1' )

    //console.log( 'pattern:', util.inspect( pattern, { depth:4 } ) )

    const result = queryArc( pattern, Fraction(0), Fraction(2) )

    //console.log( 'result:', util.inspect( result, { depth:4 } ) )
    assert.deepEqual( result, expected )

  })
  // */
})
