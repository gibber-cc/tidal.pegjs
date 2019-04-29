{
  var Fraction = require('fraction.js');

    /**
     * Parse a Tidal pattern to create an object
     * @param   {String}   body      the Tidal pattern to be parsed
     * @param   {Fraction} start = 0 the starting point in the cycle of the pattern
     * @param   {Fraction} end = 0   the ending point in the cycle of the pattern
     * @return  {Object}             the parsed object
     */
  function parse(body, start = new Fraction(0), end = new Fraction(1)){

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


pattern =  euclid / repeat / layer / group / list / onestep


// generic term for matching in groups
term "term" = body:(
  polymeter / layer / degrade / repeat / feet / group / euclid  / number / word / rest / onestep
) _ {return body}


// a list (which is a group)
list = _ body:term+ _ {
  body = parse(body)
  body.type = 'group'
  return body
}


// a group
group "group" = _ '[' _ body:term+ _ ']' _ {
  // console.log(typeof body, "in group")
  body = parse(body)
  body.type = 'group'
  return body
}


// bjorklund
euclid = _ value:noteuclid '(' _ pulses:term ',' _ slots:term ')' _ {
  return { type:'euclid', value, pulses, slots }
}
// avoid left-recursions
noteuclid = body:( group / number / word / rest / onestep) _ { return body }


// degrading individual values
degrade = value:notdegrade '?' {
  return { type:'degrade', value }
}
// avoid left-recursions
notdegrade = body:( repeat / euclid / group / number / word / onestep) _ { return body }


// match a binary operation, a la 4*2, or [0 1]*4
repeat = value:notrepeat _ operator:op  _ repeatValue:term {
  return { type:'repeat', value, operator, repeatValue }
}
// avoid left-recursions
notrepeat = body:(euclid / polymeter / group / number / word / rest /onestep) _ { return body }


polymeter = _ '{' _ left:term+ ',' _ right:term+ _ '}' _ {
  return { type:'polymeter', left, right }
}


// return a rest object
rest = '~' {
 return { type:'rest' }
}


// identifies an array of groups delimited by '.' characters
feet = start:foot+ end:term+ {

  start = parse(start[0])
  start.type = 'group'

  end = parse(end)
  end.type = 'group'

  let result = parse([start, end])
  result.type = 'group'

  return result
}
// identifies a group delimited by a '.' character
foot = value:notfoot+ dot _ {
  value.type = 'group'
  return value
}
// avoid left-recursions
notfoot = degrade / polymeter / rest repeat / euclid / group / number / word / onestep


// basically, get each list and push into an array while leaving out whitespace
// and commas
layer = _ '[' _ body:(notlayer _ ',' _ )+ end:notlayer _ ']'_ {
  const concurrent = []
  concurrent.type = 'layer'

  for( let i = 0; i < body.length; i++ ) {
  	concurrent.push( body[ i ][ 0 ] )
    concurrent[ concurrent.length - 1 ].type = 'group'
  }

  end.type = 'group'

  concurrent.push( end )

  return concurrent
}
notlayer = body:(list / euclid / polymeter / group / number / word / rest / onestep) _ { return body }


// One-step
onestep = _ '<' _ body:notonestep+_'>'_ {

  const final = []
  final.push(body[0])
  final.type = 'onestep'

  return final
}
notonestep = body:(list / euclid / polymeter / group / number / word / rest / layer) _ { return body }


word "word" = _ value:$[^ \[\] \{\} \(\) \t\n\r '*' '/' '.' '~' '?' ',' '>' '<']+ _ {
  return { type:typeof value, value }
}

// match tidal operators
op = ('*' / '/')
dot = '.'
question = '?'

number = _ "-"? (([0-9]+ "." [0-9]*) / ("."? [0-9]+)) _ {
  return { type:'number', value:+text() }
}

_ "whitespace" = [ \t\n\r ]*
