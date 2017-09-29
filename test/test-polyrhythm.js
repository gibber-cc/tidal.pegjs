/* test-polyrhythm.js
 *
 * A test of polyrhythms and nested polyrhythms.
 *
 */

const peg    = require( 'pegjs' )
const fs     = require( 'fs' )
const assert = require( 'assert')
const util   = require( 'util' )

const grammar = fs.readFileSync( __dirname + '/../tidal.pegjs', { encoding:'utf-8' }) 
const parser  = peg.generate( grammar )

describe( 'Testing polyrhythms and nested polyrhythms.', () => { 

  /*
   * "[ 0 1 2, 4 5 ]" ->
   *
   *   [
   *     [ 
   *        { type:'number', value:0 },
   *        { type:'number', value:1 },
   *        { type:'number', value:2 },
   *        type:'pattern'
   *     ],
   *     [ 
   *        { type:'number', value:3 },
   *        { type:'number', value:4 },
   *        type:'pattern'
   *     ],
   *     type:'polyrhythm'
   *   ]
   *
   */

  it( 'Commas should return a pattern marked as a polyrhythm', () => {
    const polyrhythm = [
      [ 
        { type:'number', value:0 },
        { type:'number', value:1 },
        { type:'number', value:2 },
      ],
      [ 
        { type:'number', value:3 },
        { type:'number', value:4 },
      ]
    ].map( v => { v.type = 'pattern'; return v })

    polyrhythm.type  = 'polyrhythm'
    
    const pattern = polyrhythm

    const result = parser.parse( '[ 0 1 2, 3 4 ]' )
      

    assert.deepEqual( pattern, result )
  })

})
