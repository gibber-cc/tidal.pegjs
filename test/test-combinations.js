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

describe( 'One-off tests for potentially problematic combinations.', () => {
  
   
  it( '"0 1 [2,3]" should parse correctly.', () => {
    const expected = {
      values: [
        { type: 'number', value: 0 },
        { type: 'number', value: 1 },
        { 
          type: 'layers',
          values:[{type: 'number', value: 2 },{ type: 'number', value: 3 }] 
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
        { type: 'number', value: 2 },
        { type: 'number', value: 3 },
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
        { type: 'number', value: 2 },
        {
          type: 'speed',
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
          type: 'speed',
          value:{ type:'number', value:3 },
          rate: { type:'number', value:2 }
        },
        { type: 'number', value: 2 },
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

    //console.log( '\n\nresult:', util.inspect( results, { depth:4 } ), '\n\n' )
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
  

  it('[0 <1 2>] should return two zeros, a one and a two over two cycles.', () => {
    const expected = [
      { value:0, arc:{ start:Fraction(0),   end:Fraction(1,2) } },
      { value:1, arc:{ start:Fraction(1,2), end:Fraction(1)   } },
      { value:0, arc:{ start:Fraction(1),   end:Fraction(3,2) } },
      { value:2, arc:{ start:Fraction(3,2), end:Fraction(2)   } },
    ]

    const pattern = parser.parse('[0 <1 2>]')

    const result  = queryArc( pattern, Fraction(0), Fraction(2) )

    //console.log( 'result:', util.inspect( result, { depth:4 } ), '\n\n' )

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
    const results = queryArc( pattern, Fraction(0), Fraction(1) )
    //console.log( '\n\nresult:', util.inspect( results, { depth:4 } ), '\n\n' )

    assert.deepEqual( 
      results,      
      expected 
    )
  }) 
 
  it( `"0 <2*2 1>" should schedule three events at 0, 1/2, and 3/4`, () => {
    const expected = [
      {
        value:0,
        arc: { start: Fraction(0), end:Fraction(1,2) }
      },
      {
        value:2,
        arc: { start: Fraction(1,2), end:Fraction(3/4) }
      },
      {
        value:2,
        arc: { start: Fraction(3,4), end:Fraction(1) }
      }
    ]
    
    const pattern = parser.parse('0 <2*2 1>')
    const results = queryArc( pattern, Fraction(0), Fraction(1) )
    //console.log( '\n\nresult:', util.inspect( results, { depth:4 } ), '\n\n' )

    assert.deepEqual( 
      results,      
      expected 
    )
  }) 
  

  
  it( `"[0,2]*2" should schedule four events`, () => {
    const expected = [
      {
        value:0,
        arc: { start: Fraction(0), end:Fraction(1,2) }
      },
      {
        value:2,
        arc: { start: Fraction(0), end:Fraction(1,2) }
      },
      {
        value:0,
        arc: { start: Fraction(1,2), end:Fraction(1) }
      },
      {
        value:2,
        arc: { start: Fraction(1,2), end:Fraction(1) }
      }
    ]
    
    const pattern = parser.parse('[0,2]*2')
    const results = queryArc( pattern, Fraction(0), Fraction(1) )

    assert.deepEqual( 
      results,      
      expected 
    )
  }) 

  it( `"[0,2]*2 [1,3]*2" should schedule eight events`, () => {
    const expected = [
      {
        value:0,
        arc: { start: Fraction(0), end:Fraction(1,4) }
      },
      {
        value:2,
        arc: { start: Fraction(0), end:Fraction(1,4) }
      },
      {
        value:0,
        arc: { start: Fraction(1,4), end:Fraction(1,2) }
      },
      {
        value:2,
        arc: { start: Fraction(1,4), end:Fraction(1,2) }
      },
      {
        value:1,
        arc: { start: Fraction(1,2), end:Fraction(3,4) }
      },
      {
        value:3,
        arc: { start: Fraction(1,2), end:Fraction(3,4) }
      }, 
      {
        value:1,
        arc: { start: Fraction(3,4), end:Fraction(1) }
      },
      {
        value:3,
        arc: { start: Fraction(3,4), end:Fraction(1) }
      } 
    ]
    
    const pattern = parser.parse('[0,2]*2 [1,3]*2')
    const results = queryArc( pattern, Fraction(0), Fraction(1) )

    assert.deepEqual( 
      results,      
      expected 
    )
  }) 


  it( `"[0,4]/2" should query correctly over two cycles`, () => {
    const expected = [
      {
        value:0,
        arc: { start: Fraction(0), end:Fraction(1) }
      },
      {
        value:4,
        arc: { start: Fraction(0), end:Fraction(1) }
      }
    ]
    
    const pattern = parser.parse('[0,4]/2')
    const results = queryArc( pattern, Fraction(0), Fraction(2) )

    //console.log( '\n\nresult:', util.inspect( results, { depth:4 } ), '\n\n' )
    assert.deepEqual( 
      results, 
      expected
    )
  })

  it( `"[0,4]/2" should query correctly over four cycles`, () => {
    const expected = [
      {
        value:0,
        arc: { start: Fraction(0), end:Fraction(1) }
      },
      {
        value:4,
        arc: { start: Fraction(0), end:Fraction(1) }
      },
      {
        value:0,
        arc: { start: Fraction(2), end:Fraction(3) }
      },
      {
        value:4,
        arc: { start: Fraction(2), end:Fraction(3) }
      }

    ]
    
    const pattern = parser.parse('[0,4]/2')
    const results = queryArc( pattern, Fraction(0), Fraction(4) )

    //console.log( '\n\nresult:', util.inspect( results, { depth:4 } ), '\n\n' )
    assert.deepEqual( 
      results, 
      expected
    )
  })

  // */

  //it(' weird test.', ()=> {
  //  const pattern = parser.parse('[0,4]/2')
  //  let results = []
  //  for( let i = 0; i < 4; i++ ) {
  //    results = results.concat( queryArc( pattern, Fraction(i), Fraction(1) ) )
  //  }

  //  console.log( '\n\nresult:', util.inspect( results, { depth:4 } ), '\n\n' )
  //  assert.equal( results.length, 4 )    
  //})
})
