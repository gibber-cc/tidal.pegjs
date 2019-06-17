/* test-onestep.js
 *
 * A test for one-step per cycle.
 */

const assert = require( 'assert')
const parser = require('../dist/tidal.js')

const queryArc = require( '../src/queryArc.js' ).queryArc
const Fraction = require( 'fraction.js' )
const util     = require( 'util' )

describe('Testing one-step per cycle', () => {

  it('<0 1 2> should return a group marked as onestep', () => {
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
  })

  it('<0 1 2> should return three different values when queried over three cycles.', () => {
    const expected = [
      { value:0, arc:{ start:Fraction(0), end:Fraction(1) } },
      { value:1, arc:{ start:Fraction(1), end:Fraction(2) } },
      { value:2, arc:{ start:Fraction(2), end:Fraction(3) } }
    ]

    const pattern = parser.parse('<0 1 2>')
    const result  = queryArc( pattern, Fraction(0), Fraction(3) )

    assert.deepEqual( result, expected )
  })

  // XXX is this a correct Tidal combination?
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


 })
