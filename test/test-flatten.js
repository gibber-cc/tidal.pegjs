/* test-flatten.js
 *
 * A test for the flatten function.
 *
 */

let flattenFile = require('./../src/flatten.js');
const assert = require( 'assert');

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

    assert.deepEqual(flattenFile.flatten(group), flat)
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

    assert.deepEqual(flattenFile.flatten(group), flat)

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

    assert.deepEqual(flattenFile.flatten(group), flat)
  });


it('repeat type should generate the proper repetition', () => {

  const group = {
    type:'repeat',
    operator: '*',
    repeatValue:{ type:'number', value:2 },
    value: {
      '0': { type:'number', value:2 },
      '1/2': { type:'number', value:1 },
      type: 'group'
    }
  }

  const flat = {
    '0': {type: 'number', value:2},
    '1/4': {type: 'number', value: 1},
    '1/2': {type: 'number', value: 2},
    '3/4': {type: 'number', value: 1},
    type: 'group'
  }

  assert.deepEqual(flattenFile.flatten(group), flat);

});


it('repeat type should generate the proper repetition', () => {

  const group = {
    type: 'repeat',
    operator:'*',
    repeatValue: { type: 'number', value: 2 },
    value: { type:'number', value:0 }
  }

  const flat = {
    '0': {type: 'number', value:0},
    type: 'group'
  }

  assert.deepEqual(flattenFile.flatten(group), flat);

});

})
