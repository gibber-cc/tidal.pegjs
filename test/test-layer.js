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
  it( 'A comma should return two numbers as layers', () => {

    const expected = {
      type:'layers',
      values:[
        {
          type:'group',
          values:[
            { type:'number', value:0 },
          ]
        },
        {
          type:'group',
          values:[
            { type:'number', value:1 },
          ]
        },
      ]
    }

    const result = parser.parse( '0,1' )

    assert.deepEqual( result, expected )
  })

  it( 'A comma should return two multi-digit numbers as layers', () => {

    const expected = {
      type:'layers',
      values:[
        {
          type:'group',
          values:[
            { type:'number', value:10 },
          ]
        },
        {
          type:'group',
          values:[
            { type:'number', value:11 },
          ]
        },
      ]
    }

    const result = parser.parse( '10,11' )

    assert.deepEqual( result, expected )
  })

  it( 'A comma should return two letters as layers', () => {

    const expected = {
      type:'layers',
      values:[
        {
          type:'group',
          values:[
            { type:'string', value:'a' },
          ]
        },
        {
          type:'group',
          values:[
            { type:'string', value:'b' },
          ]
        },
      ]
    }

    const result = parser.parse( 'a,b' )

    assert.deepEqual( result, expected )
  })

  it( 'A comma should return two multi-character words as layers', () => {

    const expected = {
      type:'layers',
      values:[
        {
          type:'group',
          values:[
            { type:'string', value:'kd' },
          ]
        },
        {
          type:'group',
          values:[
            { type:'string', value:'sd' },
          ]
        },
      ]
    }

    const result = parser.parse( 'kd,sd' )

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


});
