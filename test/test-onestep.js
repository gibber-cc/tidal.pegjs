/* test-onestep.js
 *
 * A test for one-step per cycle.
 */

 const peg    = require( 'pegjs' )
 const fs     = require( 'fs' )
 const assert = require( 'assert')
 const util   = require( 'util' )

 const grammar = fs.readFileSync( __dirname + '/../tidal.pegjs', { encoding:'utf-8' })
 const parser  = peg.generate( grammar )

 describe('Testing one-step per cycle', () => {

   it('<> should return a group marked as onestep', () => {
     const expected = {
       '0': {
         '0': {type: 'number', value: 0},
         '1/3': {type: 'number', value: 1},
         '2/3': {type: 'number', value: 2},
         type: 'group'
       },
       type: 'onestep'
     }

      const result = parser.parse('<0 1 2>')[0]

      assert.deepEqual( expected, result )

   });


   it('multiple <> should return nested group marked as onestep', () => {

     const expected = {
       '0': {
         '0': {type: 'number', value: 0},
         '1/3': {type: 'number', value: 1},
         '2/3': {type: 'number', value: 2},
         type: 'group'
       },
       '1/2': {
         '0': {type: 'number', value: 3},
         '1/3': {type: 'number', value: 4},
         '2/3': {type: 'number', value: 5},
         type: 'group'
       },
       type: 'onestep'
     }

     assert.deepEqual( expected, parser.parse('<0 1 2, 3 4 5>')[0] )

   });


/*

  TODO: this test does not pass yet because of the indexing issue

   it ('nested <> should return nested groups marked as onestep', () => {
     const expected = {
       '0':{
         '0': {type: 'number', value: 1},
         '1/2': {
           '0': { type: 'number', value: 2 },
           '1/2': {type: 'number', value: 4},
           type: 'onestep'
         },
         type: 'group'
       },
       '1/2': {
         '0': {type: 'number', value:5},
         '1/2': {type: 'number', value: 6},
         type: 'group'
       },
       type: 'onestep'
     }
   })

   */

 })
