/* test-layer.js
 *
 * A test of layers and nested layers.
 *
 */

const assert = require( 'assert' )
const parser = require( '../dist/tidal.js' )
const queryArc = require( '../src/queryArc.js' ).queryArc
const Fraction = require( 'fraction.js' )
const util     = require( 'util' )

describe( 'Testing layers.', () => {
  it( 'should not be greedy', ()=> {
    return parser.parse( '0 [0,1]' )
  })

  it( 'A comma should return two numbers as layers', () => {

    const expected = {
      type:'layers',
      values:[
        { type:'number', value:0 },
        { type:'number', value:1 },
      ]
    }

    const result = parser.parse( '[0,1]' )

    assert.deepEqual( result, expected )
  })

  it( 'A comma should return two multi-digit numbers as layers', () => {

    const expected = {
      type:'layers',
      values:[
        { type:'number', value:10 },
        { type:'number', value:11 },
      ]
    }

    const result = parser.parse( '[10,11]' )

    assert.deepEqual( result, expected )
  })

  it( 'A comma should return two letters as layers', () => {

    const expected = {
      type:'layers',
      values:[
        { type:'string', value:'a' },
        { type:'string', value:'b' },
      ]
    }

    const result = parser.parse( '[a,b]' )

    assert.deepEqual( result, expected )
  })

  it( 'A comma should return two multi-character words as layers', () => {

    const expected = {
      type:'layers',
      values:[
        { type:'string', value:'kd' },
        { type:'string', value:'sd' },
      ]
    }

    const result = parser.parse( '[kd,sd]' )

    assert.deepEqual( result, expected )
  })

  it( 'Commas should return groups marked as part of layers (polyrhythms)', () => {

    const expected = {
      type:'layers',
      values:[
        {
          type:'group',
          values:[
            { type:'number', value:0 },
            { type:'number', value:1 },
            { type:'number', value:2 }
          ]
        },
        {
          type:'group',
          values:[
            { type:'number', value:3 },
            { type:'number', value:4 }
          ]
        }
      ]
    }

    const result = parser.parse( '[ 0 1 2, 3 4 ]' )

    assert.deepEqual( result, expected )
  })
  
  it( 'Querying layers of different lengths should return polyrhythms.', () => {
    const expected = [
      { value:0, arc:{ start:Fraction(0),   end:Fraction(1,3) } },
      { value:1, arc:{ start:Fraction(1,3), end:Fraction(2,3) } },
      { value:2, arc:{ start:Fraction(2,3), end:Fraction(1) } },
      { value:3, arc:{ start:Fraction(0),   end:Fraction(1,2) } },
      { value:4, arc:{ start:Fraction(1,2), end:Fraction(1) } }
    ]

    const pattern = parser.parse( '[ 0 1 2, 3 4 ]' )
    const result  = queryArc( pattern, Fraction(0), Fraction(1) )

    assert.deepEqual( result, expected )
  })
  
  it( 'Querying layers for more than once cycle should work', () => {
    const expected = [
      { value:0, arc:{ start:Fraction(0),   end:Fraction(1,3) } },
      { value:1, arc:{ start:Fraction(1,3), end:Fraction(2,3) } },
      { value:2, arc:{ start:Fraction(2,3), end:Fraction(1) } },
      { value:3, arc:{ start:Fraction(0),   end:Fraction(1,2) } },
      { value:4, arc:{ start:Fraction(1,2), end:Fraction(1) } },
      { value:0, arc:{ start:Fraction(1),   end:Fraction(4,3) } },
      { value:1, arc:{ start:Fraction(4,3), end:Fraction(5,3) } },
      { value:2, arc:{ start:Fraction(5,3), end:Fraction(2) } },
      { value:3, arc:{ start:Fraction(1),   end:Fraction(3,2) } },
      { value:4, arc:{ start:Fraction(3,2), end:Fraction(2) } }
    ]

    const pattern = parser.parse( '[ 0 1 2, 3 4 ]' )
    const result  = queryArc( pattern, Fraction(0), Fraction(2) )

    //console.log( 'result:', util.inspect( result, { depth:3 } ) )
    assert.deepEqual( result, expected )
  })

  /*
  // this test is wrong, since arcs are relative to input phase argument
  it( 'Starting at phase 2 returns correct values', () => {
    const expected = [
      { value:0, arc:{ start:Fraction(2),   end:Fraction(7,3) } },
      { value:1, arc:{ start:Fraction(7,3), end:Fraction(8,3) } },
      { value:2, arc:{ start:Fraction(8,3), end:Fraction(3) } },
      { value:3, arc:{ start:Fraction(2),   end:Fraction(5,2) } },
      { value:4, arc:{ start:Fraction(5,2), end:Fraction(3) } }
    ]

    const pattern = parser.parse( '[ 0 1 2, 3 4 ]' )
    const result  = queryArc( pattern, Fraction(2), Fraction(1) )

    console.log( 'result:', util.inspect( result, { depth:3 }) )

    assert.deepEqual( result, expected )
  })
  */
});
