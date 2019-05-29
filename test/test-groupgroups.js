/* test-groupgroup.js
 *
 * A test of group groups.
 *
 */

const assert = require( 'assert')
const parser = require( '../dist/tidal.js' )
const queryArc = require( '../queryArc.js' )
const util   = require( 'util' )
const Fraction = require( 'fraction.js' )

describe( 'Testing group groups and nested group groups.', () => {
  it( 'Array brackets [] should return an array marked as a group.', () => {

    const expected = {
      values:[
        { type: 'number', value: 0 },
        { type: 'number', value: 1 },
        { type: 'number', value: 2 },
      ],
      type: 'group'
    }

    const result = parser.parse( '[ 0 1 2 ]' )

    assert.deepEqual( result, expected )
  })

  it( 'Nested brackets should return nested groups.', () => {
    const expected =
    {
      values:[
        { type: 'number', value: 0 },
        {
          values:[
            { type: 'number', value: 1 },
            { type: 'number', value: 2 },
            { type: 'number', value: 3 },
          ],
          type: 'group'
        },
      
        { type: 'number', value: 4 },
      ],
      type: 'group'
    }

    const result = parser.parse( '0 [1 2 3] 4' )

    assert.deepEqual( result, expected )
  })

  it( 'Testing nested groups three levels deep.', () => {
    const expected = {
      type:'group',
      values:[
        { type: 'number', value: 0 },
        {
          type:'group',
          values:[
            {
              type:'group',
              values:[
                { type: 'number', value: 1 },
                { type: 'number', value: 2 }
              ]
            },
            {
              type:'group',
              values:[
                { type: 'number', value: 3 },
                { type: 'number', value: 4 }
              ]
            }
          ]
        },
        { type: 'number', value: 5 },
      ]
    }

    const result = parser.parse( '0 [[ 1 2 ] [ 3 4 ]] 5' )

    assert.deepEqual( result, expected )
  })

  it( `"0 [1 2]" should schedule three events at 0, 1/2, and 3/4`, () => {
    const expected = [
      {
        value:0,
        arc: { start: Fraction(0), end:Fraction(1,2) }
      },
      {
        value:1,
        arc: { start: Fraction(1,2), end:Fraction(3/4) }
      },
      {
        value:2,
        arc: { start: Fraction(3,4), end:Fraction(1) }
      }
    ]
    
    const pattern = parser.parse('0 [1 2]')

    assert.deepEqual( 
      expected, 
      queryArc( [], pattern, Fraction(0), Fraction(1) ) 
    )
  })

  it( `"0 [1 [2 3]]" should schedule four events at 0, 1/2, 3/4, and 7/8.`, () => {
    const expected = [
      {
        value:0,
        arc: { start: Fraction(0), end:Fraction(1,2) }
      },
      {
        value:1,
        arc: { start: Fraction(1,2), end:Fraction(3,4) }
      },
      {
        value:2,
        arc: { start: Fraction(3,4), end:Fraction(7,8) }
      },
      {
        value:3,
        arc: { start: Fraction(7,8), end:Fraction(1) }
      }
    ]
    
    const pattern = parser.parse('0 [1 [2 3]]')

    assert.deepEqual( 
      expected, 
      queryArc( [], pattern, Fraction(0), Fraction(1) ) 
    )
  })

  // two feet needs a different test from > 2 feet due to PEG vagaries...
  it( "Marking flattened feet with '.' should divide groups into groups.", () => {
    const expected = {
      type:'group',
      values:[
        {
          type:'group',
          values:[
            { type: 'number', value: 0 },
            { type: 'number', value: 1 },
            { type: 'number', value: 2 },
          ]
        },
        {
          type:'group',
          values:[
            { type: 'number', value: 3 },
            { type: 'number', value: 4 }
          ]
        }
      ]
    }

    const result = parser.parse( '0 1 2 . 3 4' )//TODO: fix this indexing

    assert.deepEqual( result, expected )
  })

  it( "Testing four groups marked out by feet.", () => {
    const expected = {
      type:'group',
      values:[
        {
          type:'group',
          values:[
            { type: 'number', value: 0 },
            { type: 'number', value: 1 },
            { type: 'number', value: 2 },
          ]
        },
        {
          type:'group',
          values:[
            { type: 'number', value: 3 },
            { type: 'number', value: 4 }
          ]
        },
        {
          type:'group',
          values:[
            { type: 'number', value: 5 },
            { type: 'number', value: 6 }
          ]
        },
        {
          type:'group',
          values:[
            { type: 'number', value: 7 }
          ]
        }

      ]
    }

    const result = parser.parse( '0 1 2 . 3 4 . 5 6 . 7' )

    assert.deepEqual( result, expected )
  })
})
