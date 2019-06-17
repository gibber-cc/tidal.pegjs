const assert   = require( 'assert')
const parser   = require('../dist/tidal.js')
const queryArc = require( '../src/queryArc.js' ).queryArc
const Fraction = require( 'fraction.js' )
const util     = require( 'util' )

describe( 'One-off tests for potentially problematic combinations.', () => {

  it( '"0 1 [2,3]" should parse correctly.', () => {
    const expected = {
      values: [
        { type: 'number', value: 0 },
        { type: 'number', value: 1 },
        { 
          type: 'layers',
          values:[
            { type:'group',
              values:[{ type: 'number', value: 2 }] },
            { type:'group',
              values:[{ type: 'number', value: 3 }] }
          ]
        }
      ],
      type: 'group'
    }
    const result = parser.parse( '0 1 [2,3]' )

    assert.deepEqual( expected, result )
  })

  it( '"[2,3]" should parse correctly for two cycles.', () => {
    const expected = {
      values: [
        { type:'group',
          values:[{ type: 'number', value: 2 }] },
        { type:'group',
          values:[{ type: 'number', value: 3 }] },
      ],
      type: 'layers'
    }
    const result = parser.parse( '[2,3]' )

    assert.deepEqual( result, expected )
  })

  it( '"[2,3*2]" should parse correctly.', () => {
    const expected = {
      type: 'layers',
      values: [
        { type:'group',
          values:[{ type: 'number', value: 2 }] },
        {
          type: 'repeat',
          operator:'*',
          value:{ type:'number', value:3 },
          rate: { type:'number', value:2 }
        }
      ],
    }
    const result = parser.parse( '[2,3*2]' )

    assert.deepEqual( result, expected )
  })
  it( '"[3*2,2]" should parse correctly.', () => {
    const expected = {
      type: 'layers',
      values: [
        {
          type: 'repeat',
          operator:'*',
          value:{ type:'number', value:3 },
          rate: { type:'number', value:2 }
        },
        { type:'group',
          values:[{ type: 'number', value: 2 }] },
      ],
    }
    const result = parser.parse( '[3*2,2]' )

    assert.deepEqual( result, expected )
  })

  it( '"[3*2,2]" should query correctly.', () => {
    const expected = [
      { value:3, arc:{ start:Fraction(0), end:Fraction(1,2) } },  
      { value:3, arc:{ start:Fraction(1/2), end:Fraction(1) } },  
      { value:2, arc:{ start:Fraction(0), end:Fraction(1) } }  
    ]
    const pattern = parser.parse( '[3*2,2]' )
    const result  = queryArc( pattern, Fraction(0), Fraction(1) )

    assert.deepEqual( result, expected )
  })

  it( '"[3*2,2]" should query for two cycles correctly.', () => {
    const expected = [
      { value:3, arc:{ start:Fraction(0), end:Fraction(1,2) } },  
      { value:3, arc:{ start:Fraction(1/2), end:Fraction(1) } },  
      { value:2, arc:{ start:Fraction(0), end:Fraction(1) } },  
      { value:3, arc:{ start:Fraction(1), end:Fraction(3,2) } },  
      { value:3, arc:{ start:Fraction(3,2), end:Fraction(2) } },  
      { value:2, arc:{ start:Fraction(1), end:Fraction(2) } }  
    ]
    const pattern = parser.parse( '[3*2,2]' )
    const result  = queryArc( pattern, Fraction(0), Fraction(2) )

    //console.log( '\n\nresult:', util.inspect( result, { depth:4 } ), '\n\n' )

    assert.deepEqual( result, expected )
  })

  it( `"0 1 [2,3]" should query correctly`, () => {
    const expected = [
      {
        value:0,
        arc: { start: Fraction(0), end:Fraction(1,3) }
      },
      {
        value:1,
        arc: { start: Fraction(1,3), end:Fraction(2,3) }
      },
      {
        value:2,
        arc: { start: Fraction(2,3), end:Fraction(1) }
      },
      {
        value:3,
        arc: { start: Fraction(2,3), end:Fraction(1) }
      }
    ]
    
    const pattern = parser.parse('0 1 [2,3]')
    const results = queryArc( pattern, Fraction(0), Fraction(1) )

    assert.deepEqual( 
      results, 
      expected
    )
  })
  
  it('<0*2 1> should return two zero events and one 1 event over two cycles.', () => {
    const expected = [
      { value:0, arc:{ start:Fraction(0),   end:Fraction(1,2) } },
      { value:0, arc:{ start:Fraction(1,2), end:Fraction(1)   } },
      { value:1, arc:{ start:Fraction(1),   end:Fraction(2)   } },
    ]

    const pattern = parser.parse('<0*2 1>')

    const result  = queryArc( pattern, Fraction(0), Fraction(2) )

    assert.deepEqual( result, expected )
  })
})
