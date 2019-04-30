/*
 * parse.js file
 *
 * Contains function to parse a Tidal pattern
 * in Tidal syntax and return an object
 *
 */

var Fraction = require('fraction.js');

/**
 * Parse a Tidal pattern to create an object
 * @param   {String}   body      the Tidal pattern to be parsed
 * @param   {Fraction} start = 0 the starting point in the cycle of the pattern
 * @param   {Fraction} end = 0   the ending point in the cycle of the pattern
 * @return  {Object}             the parsed object
 */
module.exports = {
  parseToObject:
    function parseToObject(body, start = new Fraction(0), end = new Fraction(1)){

      let cycleBody = {};
      let cycleSection = start;
      let frac = new Fraction(end/body.length);

      for( let i = 0; i < body.length; i++ ) {
        cycleBody[cycleSection.toFraction(false)] = body[i];
        cycleSection = new Fraction(cycleSection).add(frac);
      }
      return cycleBody;
    }
}
