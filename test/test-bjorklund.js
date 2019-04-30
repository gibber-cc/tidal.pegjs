/* test-bjorklund.js
 *
 * A test for matching Euclidean rhythms in the Tidal DSL
 *
 */

const peg    = require( 'pegjs' )
const fs     = require( 'fs' )
const assert = require( 'assert')
const util   = require( 'util' )

const grammar = fs.readFileSync( __dirname + '/../src/tidal.pegjs', { encoding:'utf-8' })
const parser  = peg.generate( grammar )

describe( 'Testing Euclidean rhythms.', () => {

  it( 'should generate a euclidean rhythm', () => {
    const expected = {
      value: { type:'number', value:60 },
      soundNum:{ type:'number', value:3  },
      steps: { type:'number', value:8  },
      rotateStep: null,
      type:  'euclid'
    }

    const result = parser.parse( '60( 3,8)' )

    assert.deepEqual( expected, result )
  });


  it( 'should generate a euclidean rhythm with a group determining soundNum', () => {
    const group ={
      value: { type:'number', value:60 },
      soundNum:{
        '0': { type:'number', value:3 },
        '1/2': { type:'number', value:5 },
      },
      steps: { type:'number', value:8  },
      rotateStep: null,
      type:  'euclid'
    }

    const result = parser.parse( '60( [3 5],8 )' )

    assert.deepEqual( group, result )
  });


  it( 'should generate a euclidean rhythm with a group determining soundNum and a number for rotateStep', () => {
    const group ={
      value: { type:'number', value:60 },
      soundNum: { type:'number', value:5 },
      steps: { type:'number', value:8  },
      rotateStep: {type: 'number', value:2},
      type:  'euclid'
    }

    const result = parser.parse( '60( 5,8,2 )' )

    assert.deepEqual( group, result )
  });

})
