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

   /*
      "<0 1 2>" ->
      [
        [
          [
            {type: 'number', value: 0},
            {type: 'number', value: 1},
            {type: 'number', value: 2},
            type: 'group'
         ],
         type: 'onestep'
       ],
       type: 'group'
     ]

   **/

   it('<> should return a group marked as onestep', () => {
     const onestep = [
       [
         [
           {type: 'number', value: 0},
           {type: 'number', value: 1},
           {type: 'number', value: 2}
        ]
      ]
     ]

     onestep[0][0].type = 'group'
     onestep[0].type = 'onestep'
     onestep.type = 'group'

     const result = parser.parse('<0 1 2>')

     assert.deepEqual(onestep, result)

   })

   /*
      "<0 1 2, 3 4 5>" ->
      [
        [
          [
            {type: 'number', value: 0},
            {type: 'number', value: 1},
            {type: 'number', value: 2},
            type: 'group'
         ],
         type: 'onestep'
       ],
       type: 'group'
     ]



   **/

 })
