// /* test-layer.js
//  *
//  * A test of layers and nested layers.
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
// describe( 'Testing layers and nested layers.', () => {
//
//   /*
//    * "[ 0 1 2, 4 5 ]" ->
//    *
//    *   [
//    *     [
//    *        { type:'number', value:0 },
//    *        { type:'number', value:1 },
//    *        { type:'number', value:2 },
//    *        type:'group'
//    *     ],
//    *     [
//    *        { type:'number', value:3 },
//    *        { type:'number', value:4 },
//    *        type:'group'
//    *     ],
//    *     type:'layer'
//    *   ]
//    *
//    */
//
//   it( 'Commas should return a group marked as a layer', () => {
//     const layer = [
//       [
//         { type:'number', value:0 },
//         { type:'number', value:1 },
//         { type:'number', value:2 },
//       ],
//       [
//         { type:'number', value:3 },
//         { type:'number', value:4 },
//       ]
//     ].map( v => { v.type = 'group'; return v })
//
//     layer.type  = 'layer'
//
//     const group = layer
//
//     const result = parser.parse( '[ 0 1 2, 3 4 ]' )
//
//
//     assert.deepEqual( group, result )
//   })
//
// })
