// /* test-rest.js
//  *
//  * A test for rests in Tidal
//  *
//  */
//
// const peg    = require( 'pegjs' )
// const fs     = require( 'fs' )
// const assert = require( 'assert')
//
// const grammar = fs.readFileSync( __dirname + '/../tidal.pegjs', { encoding:'utf-8' })
// const parser  = peg.generate( grammar )
//
// describe( 'Testing rests.', () => {
//   /*
//    * "0 ~ 2 ~"
//    *
//    * ->
//    *
//    *  [
//    *    { type:'number', value:0 },
//    *    { type:'rest' },
//    *    { type:'number', value:2 },
//    *    { type:'rest' }
//    *    type:'group'
//    *  ]
//    *
//    */
//
//   it( 'should generate a rest object when parsing a ~', () => {
//     const group = [
//       { type:'number', value:0 },
//       { type:'rest' },
//       { type:'number', value:2 },
//       { type:'rest' },
//     ]
//     group.type  = 'group'
//
//     const result = parser.parse( '0 ~ 2 ~' )
//
//     assert.deepEqual( group, result )
//   })
//
// })
