{
  // find a token that is a comma
  const findComma = v => v.type === 'string' && v.value === ',' 
  // find a token that is a .
  const findDot   = v => v.type === 'string' && v.value === '.' 
}

// top-level match, either returns a pattern or an array 
// of pattern groups
series = top:(feet / pattern)+ {
  const end = top.length > 1 ? top : top[0]
  top.type = 'pattern'
  return top
}

// favor matching top-level lists and other data structures
// over words (left to right precedence)
pattern "pattern" = body:( repeat / euclid / token ) _ { 
  return body
}

// match a binary operation, a la 4*2, or [0 1]*4
repeat = value:token op:op repeatValue:token {
  return { type:'repeat', value, op, repeatValue }
}

// match bjorklund(aka euclidiean) rhythm, a la 5(3,8)
// return as an object with type, pulses and slots properties.
euclid = value:token '(' _ pulses:token ',' _ slots:token ')' {
  return { type:'euclid', value, pulses, slots }
}

// return a rest object
rest = '~' { 
 return { type:'rest' } 
}

token = (number / rest / word / list )

// identifies an array of groups delimited by '.' characters 
feet = start:foot+ end:(token _)+ {
  const __end = end.map( v => v[0] )
  __end.type = 'group'
  
  start.push( __end )
  start.type = 'group'

  return start
} 


// identifies a group delimited by a '.' character
foot = value:(token _)+ _ dot _ { 
	let group = value.map( v => v[0] )
  group.type = 'group'
  return group
}

// match polyrhtyhms and polymeters
list "list" = ( "[" / "{" ) _
body:pattern* _ delimiter:( "]" / "}" ) {
  let returnValue = body
  body.type =  delimiter === ']' ? 'group' : 'polymeter'

  if( body.type === 'group' && body.findIndex( findComma ) > -1 ) {
    const concurrent = []

    let end = body.findIndex( findComma )

    // while we still find commas in our pattern...
    while( end > -1 ) {
      const group = body.splice( 0, end + 1 )
      group.pop() // get rid of comma
      group.type = 'group'
      concurrent.push( group )
      end = body.findIndex( findComma )
    }

    body.type = 'group'
    concurrent.push( body )

    returnValue = concurrent
    returnValue.type = 'polyrhythm'
  }

  return returnValue 
}

dot = '.'

// match one or more tokens or expressions that does not 
// contain [], {}, or + - * /
word "word" = value:$[^ \[\] \{\} \(\) \t\n\r '*' '/' '.' '~' ]+ {
  return { type:typeof value, value }
}

// match tidal operators
op = '*' / '/'

// match a number, with or without decimals, positive or negative
// return value as number, not as string
number = "-"? (([0-9]+ "." [0-9]*) / ("."? [0-9]+)) {
  return { type:'number', value:+text() } 
}

// match zero or more whitespaces (tabs, spaces, newlines)
_ "whitespace" = [ \t\n\r ]*
