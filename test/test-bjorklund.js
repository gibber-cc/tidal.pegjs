/* test-bjorklund.js
 *
 * A test for matching Euclidean rhythms in the Tidal DSL
 *
 */

const assert = require( 'assert')
const parser = require('../dist/tidal.js')

describe( 'Testing Euclidean rhythms.', () => {

  it( 'should generate a euclidean rhythm', () => {
    const expected = {
      value: { type:'number', value:60 },
      pulses:{ type:'number', value:3  },
      slots: { type:'number', value:8  },
      rotation: null,
      type:  'euclid'
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
      type: 'euclid'
    }

    const result = parser.parse( '60( [3 5],8 )' )

    assert.deepEqual( group, result )
  })


  it( 'should generate a euclidean rhythm with a group determining soundNum and a number for rotateStep', () => {
    const group ={
      value: { type:'number', value:60 },
      pulses: { type:'number', value:5 },
      slots: { type:'number', value:8  },
      rotation: {type: 'number', value:2},
      type:  'euclid'
    }

    const result = parser.parse( '60( 5,8,2 )' )

    assert.deepEqual( group, result )
  })

})
