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
//   /*
//    * "60( 3,8 )
//    *
//    * ->
//    *
//    *  [
//    *    {
//    *      type:'euclid',
//    *      value: { type:'number', value:60 },
//    *      pulses:{ type:'number', value:3 },
//    *      slots: { type:'number', value:8 }
//    *    },
//    *    type:'group'
//    *  ]
//    *
//    */
//
//   it( 'should generate a euclidean rhythm', () => {
//     const group = {
//       value: { type:'number', value:60 },
//       pulses:{ type:'number', value:3  },
//       slots: { type:'number', value:8  },
//       type:  'euclid'
//     }
//
//     const result = parser.parse( '60( 3,8 )' )
//
//     assert.deepEqual( group, result )
//   })
//
//   /*
//    * "60( [3,5],8 )
//    *
//    * ->
//    *
//    *  [
//    *    {
//    *      type:'euclid',
//    *      value: { type:'number', value:60 },
//    *      pulses:[
//    *        { type:'number', value:3 },
//    *        { type:'number', value:5 },
//    *        type:'group'
//    *      ],
//    *      slots: { type:'number', value:8 }
//    *    },
//    *    type:'group'
//    *  ]
//    *
//    */
//
//   it( 'should generate a euclidean rhythm with a group determining pulses', () => {
//     const group =
//       {
//         value: { type:'number', value:60 },
//         pulses:[
//           { type:'number', value:3 },
//           { type:'number', value:5 },
//         ],
//         slots: { type:'number', value:8  },
//         type:  'euclid'
//       }
//
//
//     group.pulses.type = 'group'
//
//     const result = parser.parse( '60( [3 5],8 )' )
//
//     assert.deepEqual( group, result )
//   })
//
// })
