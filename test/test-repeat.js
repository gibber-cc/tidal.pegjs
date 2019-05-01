/* test-repeat.js
 *
 * A tests for repeats in Tidal.
 *
 */

const assert = require( 'assert')
const parser = require('../dist/tidal.js')

describe( "Testing repeats with '*'", () => {


  it( 'should generate a 2x repeat on a number.', () => {

    const expected = {
      type: 'repeat',
      operator:'*',
      repeatValue: { type: 'number', value: 2 },
      value: { type:'number', value:0 }
    }

    const result = parser.parse( '0*2' )

    assert.deepEqual(result, expected)

  });


  it( 'should generate a 2x repeat on a group pattern', () => {
    const expected = {
      type:'repeat',
      operator: '*',
      repeatValue:{ type:'number', value:2 },
      value: {
        '0': { type:'number', value:2 },
        '1/2': { type:'number', value:1 },
        type: 'group'
      },
    }

    const result = parser.parse( '[2 1]*2' )

    assert.deepEqual( result, expected )

  });

  it('test euclid and repeat', () => {

    const expected = {
      '0': {type: 'number', value: 0},
      '1/3':{
        '0':{
          '0': {type: 'number', value:2},
          '1/2': {type: 'number', value: 3},
          type: 'group'
        },
        '1/2': {
          '0': {type: 'number', value: 2},
          '1/3': {
            value: {type: 'number', value: 4},
            soundNum: {type: 'number', value: 3},
            steps: {type: 'number', value: 8},
            rotateStep: {type: 'number', value: 9},
            type: 'euclid'
          },
          '2/3': {
            type: 'repeat',
            operator: '*',
            repeatValue: {type: 'number', value: 2},
            value: {type: 'number', value:7}
          }
        }
      },
      '2/3': {type: 'number', value: 5},
      type: 'group'
    }

    const result = parser.parse('0 [[2 3] [2 4(3,8,9) 7*2]] 5');
  });

})
