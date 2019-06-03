/* test-onestep.js
 *
 * A test for one-step per cycle.
 */

const assert = require( 'assert')
const parser = require('../dist/tidal.js')

 describe('Testing one-step per cycle', () => {

   it('<> should return a group marked as onestep', () => {
     const expected = {
       type:'onestep',
       values:[{
         type:'group',
         values:[
           { type: 'number', value: 0 },
           { type: 'number', value: 1 },
           { type: 'number', value: 2 }
         ]
       }]
     }
     const result = parser.parse('<0 1 2>')

     assert.deepEqual( result, expected )
   });

   it('multiple <> should return nested group marked as onestep', () => {

     const expected = {
       type:'onestep',
       values:[
         {
           type:'group',
           values:[
             { type: 'number', value: 0 },
             { type: 'number', value: 1 },
             { type: 'number', value: 2 }
           ],
         },
         {
           type:'group',
           values:[
            { type: 'number', value: 3 },
            { type: 'number', value: 4 },
            { type: 'number', value: 5 }
           ]
         },
       ]
     }

     assert.deepEqual( parser.parse('<0 1 2, 3 4 5>'), expected )

   })

   
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
