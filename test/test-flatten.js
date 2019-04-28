/* test-flatten.js
 *
 * A test for the flatten function.
 *
 */

var Fraction = require('fraction.js');
const assert = require( 'assert');


/**
 * [flatten description]
 * @param  {[type]} group [description]
 * @return {[type]}       [description]
 */
function flatten(group){

  let currentPosition = new Fraction(0)
  const flattened = {}

  function calc( group, dur = new Fraction( 1, Object.keys(group).length - 1 ) ){
    for( let key in group ) {
      if( key === 'type' ) continue
      const step = group[ key ]
      if( step.type === 'group' ) {
        const groupDur = new Fraction( 1, Object.keys( step ).length - 1 )
        calc( step, dur.mul( groupDur ) )
      }else{
        flattened[ currentPosition.toFraction( false ) ] = step
        currentPosition = currentPosition.add( dur )
      }
    }
  }

  calc(group)

  return flattened

}



describe( 'Testing flatten function on parsed groups and parsed nested groups', () => {


  it( 'Flat objects should return the same thing without the `type` key', () => {

    const group = {
      '0': {type: 'number', value: 0},
      '1/3': {type: 'number', value: 1},
      '2/3': {type: 'number', value: 2},
      type: 'group'
    }

    const flat = {
      '0': {type: 'number', value: 0},
      '1/3': {type: 'number', value: 1},
      '2/3': {type: 'number', value: 2},
    }

    assert.deepEqual(flatten(group), flat)
  })


  it( 'Nested objects should return flattened object with correct cycle fractions', () => {
    const group =
    {
      '0': {type: 'number', value: 0},
      '1/3': {
        '0': {type: 'number', value: 1},
        '1/3': {type: 'number', value: 2},
        '2/3': {type: 'number', value: 3},
        type: 'group'
      },
      '2/3': {type: 'number', value: 4},
      type: 'group'
    }

    const flat = {
      '0': {type: 'number', value: 0},
      '1/3': {type: 'number', value: 1},
      '4/9': {type: 'number', value: 2},
      '5/9': {type: 'number', value: 3},
      '2/3': {type: 'number', value: 4},
    }

    assert.deepEqual(flatten(group), flat)

  })


  it( 'Nested objects should return flattened object with proper cycle fractions', () => {

    const group =
    {
      '0': {type: 'number', value: 0},
      '1/3': {
        '0': {
          '0': {type: 'number', value: 0},
          '1/3': {type: 'number', value: 1},
          '2/3': {type: 'number', value: 2},
          type: 'group'
        },
        '1/2': {
          '0': {type: 'number', value: 3},
          '1/2': {type: 'number', value: 4},
          type: 'group'
        },
        type: 'group'
      },
      '2/3': {type: 'number', value: 5},
      type: 'group'
    }

    const flat = {
      '0': {type: 'number', value: 0},
      '1/3': {type: 'number', value: '0'},
      '7/18': {type: 'number', value: '1'},    // 1/3 + ((1/3 : 2):3)
      '4/9': {type: 'number', value: '2'},     // 1/3 + ((1/3 : 2):3)*2
      '1/2': {type: 'number', value: '3'},   // 1/3 + ((1/3 : 2):3)*2 + ((1/3:2):2)
      '7/12': {type: 'number', value: '4'},   // 1/3 + ((1/3 : 2):3)*2 + ((1/3:2):2)*2
      '2/3': {type: 'number', value: '5'},
    }

    assert.deepEqual(flatten(group), flat)

  })
})
