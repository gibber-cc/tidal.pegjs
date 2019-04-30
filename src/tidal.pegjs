{
  let parseFile = require('../../../../src/parseToObject.js');
}

pattern =  euclid / repeat / layer / group / list / onestep


// generic term for matching in groups
term "term" = body:(
  polymeter / layer / degrade / repeat / feet / group / euclid  / number / word / rest / onestep
) _ {return body}


// a list (which is a group)
list = _ body:term+ _ {
  body = parseFile.parseToObject(body)
  body.type = 'group'
  return body
}


// a group
group "group" = _ '[' _ body:term+ _ ']' _ {
  // console.log(typeof body, "in group")
  body = parseFile.parseToObject(body)
  body.type = 'group'
  return body
}


// // bjorklund
euclid = _ value:noteuclid '(' _ soundNum:term+ ',' _ steps:term+ _ ')'? ','? _ rotateStep:term* _ ')'? {

  let result = {};
  result.soundNum = soundNum[0];
  if (result.soundNum.type === 'group') delete result.soundNum.type;
  result.steps = steps[0];
  if (rotateStep) result.rotateStep = rotateStep[0];
  else result.rotateStep = null;
  result.value = value;
  result.type = 'euclid';

  return result;
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
  return { type:'repeat', operator, repeatValue, value }
}
// avoid left-recursions
notrepeat = body:(euclid / polymeter / group / number / word / rest /onestep) _ { return body }


polymeter = _ '{' _ left:term+ ',' _ right:term+ _ '}' _ {

  left = parseFile.parseToObject(left)
  left.type = 'group'
  right = parseFile.parseToObject(right)
  right.type = 'group'

  let result = {
    left: left,
    right: right,
    type: 'polymeter'
  }

  return result
}


// return a rest object
rest = '~' {
 return { type:'rest' }
}


// identifies an array of groups delimited by '.' characters
feet = start:foot+ end:term+ {

  start = parseFile.parseToObject(start[0])
  start.type = 'group'

  end = parseFile.parseToObject(end)
  end.type = 'group'

  let result = parseFile.parseToObject([start, end])
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

  for( let i = 0; i < body.length; i++ ) {
  	concurrent.push( body[ i ][ 0 ] )
    concurrent[ concurrent.length - 1 ].type = 'group'
  }

  end.type = 'group'
  concurrent.push( end )

  let result = parseFile.parseToObject(concurrent)
  result.type = 'layer'

  return result
}
notlayer = body:(list / euclid / polymeter / group / number / word / rest / onestep) _ { return body }


// One-step
onestep = _ '<'  _ body:(notonestep _ ','? _ )+ end:notonestep? _'>'_ {

  const concurrent = []

  for( let i = 0; i < body.length; i++ ) {
    concurrent.push( body[ i ][ 0 ] )
    concurrent[ concurrent.length - 1 ].type = 'group'
  }

  if (end){
    end.type = 'group'
    concurrent.push( end )
  }


  let result = parseFile.parseToObject(concurrent)
  result.type = 'onestep'

  return result
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
