// /*
//   test-polymeter.js
//
//   A test for polymeters.
//
//   From https://tidalcycles.org/index.php/Tutorial:
//   "A polymeter pattern is one where two patterns have different sequence lengths,
//   but share the same pulse or tempo.
//   You use curly brace syntax to create a polymeter rhythm:
//
//   d1 $ sound "{bd hh sn cp, arpy bass2 drum notes can}"
//
//   The code above results in a five-note rhythm being played at
//   the pulse of a four-note rhythm. If you switch the groups around,
//   it results in a four-note rhythm over a five-note rhythm:
//
//   d1 $ sound "{arpy bass2 drum notes can, bd hh sn cp}""
// */
//
// const peg    = require( 'pegjs' )
// const fs     = require( 'fs' )
// const assert = require( 'assert')
// const util   = require( 'util' )
//
// const grammar = fs.readFileSync( __dirname + '/../tidal.pegjs', { encoding:'utf-8' })
// const parser  = peg.generate( grammar )
//
// describe('Testing polymeters', () => {
//
//   /*
//     "{1 2 3 4, 1 2 3 4 5}" ->
//     [
//       [
//
//       ]
//     ]
//   */
//
//   it('{} should return a group marked as polymeter', () => {
//     const expected = [
//       {
//         type: 'polymeter',
//         left: [
//           {type: 'number', value: 1},
//           {type: 'number', value: 2},
//           {type: 'number', value: 3},
//           {type: 'number', value: 4}
//         ],
//         right: [
//           {type: 'number', value: 1},
//           {type: 'number', value: 2},
//           {type: 'number', value: 3},
//           {type: 'number', value: 4},
//           {type: 'number', value: 5}
//         ]
//       }
//     ]
//
//     expected.type = 'group'
//
//     const result = parser.parse('{1 2 3 4, 1 2 3 4 5}')
//
//     assert.deepEqual(expected, result)
//
//   })
//
// })