/* test-groupgroup.js
 *
 * A test of group groups.
 *
 */

const peg    = require( 'pegjs' )
const fs     = require( 'fs' )
const assert = require( 'assert')

const grammar = fs.readFileSync( __dirname + '/../tidal.pegjs', { encoding:'utf-8' })
const parser  = peg.generate( grammar )

var Fraction = require('fraction.js');

/**
  * Flattens an object with fractions within a cycle.
*/
function flatten(group, key = '0', parentKey = new Fraction(0), flat = {}, i = 0){

  // If group contains nested groups iterate through the subgroups
  if (typeof group === 'object') {

    // Calculate duration of elements in the group
    let duration = durationCalculation(i, key, group);

    Object.keys(group).forEach(function (item) {

      // If item we are on is an object calculate the fraction and do a recursive call
      if (typeof group[item] === 'object'){

        let phase = phaseCalculation(item, parentKey, duration);
        let resultingFraction = parentKey.add(phase);

        // If group we are on is flattened and ready to add to result
        if ('value' in group[item]){
          flat[resultingFraction.toFraction(false)] = group[item];
          i++;
          return;
        }
        else {
          flatten(group[item], new Fraction(item), phase, flat, i);
        }
      }

      // If item we are on is not an object (i.e. type:'group') just add it to result
      else {
        flat[item] = group[item];
        i++;
      }
    });
  }
  return flat;
}


/**
  Calculates duration of each element in a cycle or subcycle
*/
function durationCalculation(index, key, group){

  let i = new Fraction(index);
  let item = new Fraction(key);
  let length = Object.keys(group).length - 1;

  return i.mul(item.div(length));

}


/**
 */
function phaseCalculation(key, parentKey, duration){
  let k = new Fraction(key);
  console.log("key", key, "parentKey", parentKey, "duration", duration, "phase result", k.add(parentKey.mul(duration)));
  return k.add(parentKey.mul(duration));
}


describe( 'Testing group groups and nested group groups.', () => {

   /*
      '[0 1 2]' -> not flattened or flattened
      {
        '0': {type: 'number', value: 0},
        '1/3': {type: 'number', value: 1},
        '2/3': {type: 'number', value: 2},
        type: 'group'
      }
   */

  it( 'Array brackets [] should return an array marked as a group.', () => {

    const group = {
      '0': {type: 'number', value: 0},
      '1/3': {type: 'number', value: 1},
      '2/3': {type: 'number', value: 2},
      type: 'group'
    }

    const result = parser.parse( '[ 0 1 2 ]' )

    assert.deepEqual( group, result )
    assert.deepEqual(group, flatten(result))
  })

   /*
      TODO: nested groups should have the cycle number with respect to the
      bigger cycle, not the subsection

      '0 [[ 0 1 2 ] [ 3 4 ]] 5' ->
      NOT FLATTENED:
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

      FLATTENED:
      {
        '0': {type: 'number', value: 0},
        '1/3': {type: 'number', value: '0'},
        '7/18': {type: 'number', value: '1'},    // 1/3 + ((1/3 : 2):3)
        '4/9': {type: 'number', value: '2'},     // 1/3 + ((1/3 : 2):3)*2
        '1/2': {type: 'number', value: '3'},   // 1/3 + ((1/3 : 2):3)*2 + ((1/3:2):2)
        '7/12': {type: 'number', value: '4'},   // 1/3 + ((1/3 : 2):3)*2 + ((1/3:2):2)*2
        '2/3': {type: 'number', value: '5'},
      }

      OR:
      {
        '0/36: {type: 'number', value: 0},
        '12/36': {type: 'number, value: '0'},
        '14/36': {type: 'number, value: '1'},
        '16/36': {type: 'number, value: '2'},
        '19/36': {type: 'number, value: '3'},
        '22/36': {type: 'number, value: '4'},
        '24/36': {type: 'number, value: '5'},
      }

   */

  it( 'Nested brackets should return nested groups.', () => {
    const expected =
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

    const result = parser.parse( '0 [[ 0 1 2 ] [ 3 4 ]] 5' )

    console.log(flatten(result))
    //flatten(result)

    assert.deepEqual( expected, result )
  })

  /*
    '0 1 2 . 3 4' ->
    {
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
    }
  */

  // it( '"Marking out feet" should divide groups into groups.', () => {
  //   const expected =
  //   {
  //     '0': {
  //       '0': {type: 'number', value: 0},
  //       '1/3': {type: 'number', value: 1},
  //       '2/3': {type: 'number', value: 2},
  //       type: 'group'
  //     },
  //     '1/2': {
  //       '0': {type: 'number', value: 3},
  //       '1/2': {type: 'number', value: 4},
  //       type: 'group'
  //     },
  //     type: 'group'
  //   }
  //
  //   const result = parser.parse( '0 1 2 . 3 4' )
  //
  //   assert.deepEqual( expected, result )
  // })
})
