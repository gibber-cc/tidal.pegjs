// /* test-bjorklund.js
//  *
//  * A test for matching Euclidean rhythms in the Tidal DSL
//  *
//  */
//
// const peg    = require( 'pegjs' )
// const fs     = require( 'fs' )
// const assert = require( 'assert')
// const util   = require( 'util' )
//
// const grammar = fs.readFileSync( __dirname + '/../tidal.pegjs', { encoding:'utf-8' })
// const parser  = peg.generate( grammar )
//
// describe( 'Testing Euclidean rhythms.', () => {
//
//   it( 'should generate a euclidean rhythm', () => {
//     const expected = {
//       value: { type:'number', value:60 },
//       pulses:{ type:'number', value:3  },
//       slots: { type:'number', value:8  },
//       type:  'euclid'
//     }
//
//     const result = parser.parse( '60( 3,8 )' )
//
//     assert.deepEqual( expected, result )
//   });
//
//
//   it( 'should generate a euclidean rhythm with a group determining pulses', () => {
//     const group ={
//       value: { type:'number', value:60 },
//       pulses:{
//         '0': { type:'number', value:3 },
//         '1/2': { type:'number', value:5 },
//       },
//       slots: { type:'number', value:8  },
//       type:  'euclid'
//     }
//
//     const result = parser.parse( '60( [3 5],8 )' )
//
//     assert.deepEqual( group, result )
//   });
//
//
//   it( 'should generate a euclidean rhythm with a group determining pulses', () => {
//     const group ={
//       value: { type:'number', value:60 },
//       pulses:{
//         '0': { type:'number', value:3 },
//         '1/2': { type:'number', value:5 },
//       },
//       slots: { type:'number', value:8  },
//       type:  'euclid'
//     }
//
//     const result = parser.parse( '60( 5,8,2 )' )
//
//     assert.deepEqual( group, result )
//   });
//
// })
