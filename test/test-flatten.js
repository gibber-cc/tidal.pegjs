// /* test-flatten.js
//  *
//  * A test for the flatten function.
//  *
//  */
//
// var Fraction = require('fraction.js');
// const assert = require( 'assert');
//
//
// /**
//  * Flattens objects that resulted from parsing Tidal patterns
//  * @param  {Object} group the nested (or not nested) object to be flattened
//  * @return {Object}       the flattened object with correct fractions in a cycle
//  */
// function flatten(group){
//
//   let currentPosition = new Fraction(0) // Start at 0 and increase every iteration
//   const flattened = {}
//
//   /**
//    * Recursive inner function to add proper fractions as keys to the flattened object
//    * @param  {Object}   group    the group or subgroup to be flattened
//    * @param  {Fraction} dur      the duration of each subgroup in the group
//    */
//   function calc( group, dur = new Fraction( 1, Object.keys(group).length - 1 ) ){
//
//     for( let key in group ) {
//
//       if( key === 'type' ) continue // No type specification in the flattened object
//
//       const step = group[ key ]
//
//       if( step.type === 'group' ) { // Nested step so do a recursive call
//         const groupDur = new Fraction( 1, Object.keys( step ).length - 1 )
//         calc( step, dur.mul( groupDur ) )
//       }
//       else{ // Step is flat so add to global flattened const
//         flattened[ currentPosition.toFraction( false ) ] = step
//         currentPosition = currentPosition.add( dur )
//       }
//     }
//   }
//
//   calc(group) // Call to the inner function
//
//   return flattened // Final flattened object
//
// }
//
//
//
// describe( 'Testing flatten function on parsed groups and parsed nested groups', () => {
//
//
//   it( 'Flat objects should return the same thing without the `type` key', () => {
//
//     const group = {
//       '0': {type: 'number', value: 0},
//       '1/3': {type: 'number', value: 1},
//       '2/3': {type: 'number', value: 2},
//       type: 'group'
//     }
//
//     const flat = {
//       '0': {type: 'number', value: 0},
//       '1/3': {type: 'number', value: 1},
//       '2/3': {type: 'number', value: 2},
//     }
//
//     assert.deepEqual(flatten(group), flat)
//   })
//
//
//   it( 'Nested objects should return flattened object with correct cycle fractions', () => {
//     const group =
//     {
//       '0': {type: 'number', value: 0},
//       '1/3': {
//         '0': {type: 'number', value: 1},
//         '1/3': {type: 'number', value: 2},
//         '2/3': {type: 'number', value: 3},
//         type: 'group'
//       },
//       '2/3': {type: 'number', value: 4},
//       type: 'group'
//     }
//
//     const flat = {
//       '0': {type: 'number', value: 0},
//       '1/3': {type: 'number', value: 1},
//       '4/9': {type: 'number', value: 2},
//       '5/9': {type: 'number', value: 3},
//       '2/3': {type: 'number', value: 4},
//     }
//
//     assert.deepEqual(flatten(group), flat)
//
//   })
//
//
//   it( 'Nested objects should return flattened object with proper cycle fractions', () => {
//
//     const group =
//     {
//       '0': {type: 'number', value: 0},
//       '1/3': {
//         '0': {
//           '0': {type: 'number', value: 0},
//           '1/3': {type: 'number', value: 1},
//           '2/3': {type: 'number', value: 2},
//           type: 'group'
//         },
//         '1/2': {
//           '0': {type: 'number', value: 3},
//           '1/2': {type: 'number', value: 4},
//           type: 'group'
//         },
//         type: 'group'
//       },
//       '2/3': {type: 'number', value: 5},
//       type: 'group'
//     }
//
//     const flat = {
//       '0': {type: 'number', value: 0},
//       '1/3': {type: 'number', value: '0'},
//       '7/18': {type: 'number', value: '1'},    // 1/3 + ((1/3 : 2):3)
//       '4/9': {type: 'number', value: '2'},     // 1/3 + ((1/3 : 2):3)*2
//       '1/2': {type: 'number', value: '3'},   // 1/3 + ((1/3 : 2):3)*2 + ((1/3:2):2)
//       '7/12': {type: 'number', value: '4'},   // 1/3 + ((1/3 : 2):3)*2 + ((1/3:2):2)*2
//       '2/3': {type: 'number', value: '5'},
//     }
//
//     assert.deepEqual(flatten(group), flat)
//
//   })
// })
