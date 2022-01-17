/* test-pattern.js
 *
 * A test for the Pattern function
 *
 */

const assert = require('assert');
const Pattern = require('../dist/pattern.js');
const Fraction = require('fraction.js');
const util = require('util');

describe('Testing Pattern.', () => {
  it('should query events', () => {
    const result = Pattern('[A <B C>]')
      .query(0, 1)
      .map((e) => e.value);

    assert.deepEqual(result, ['A', 'B']);
  });
  it('should query events from a non zero start', () => {
    const result = Pattern('[A <B C>]')
      .query(1, 1)
      .map((e) => e.value);

    assert.deepEqual(result, ['A', 'C']);
  });
});
