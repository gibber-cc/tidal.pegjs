series = top:pattern+ {
  top.type = 'pattern'
  return top
}

// favor matching top-level lists and other data structures
// over words (left to right precedence)
pattern "pattern" = body:( binop / euclid / token ) _ { 
  return body
}

// match a binary operation, a la 4*2, or [0 1]*4
binop = left:token op:op right:token {
  return { type:'binop', left, op, right }
}

// match bjorklund(aka euclidiean) rhythm, a la 5(3,8)
// return as an object with type, pulses and slots properties.
euclid = value:token '(' _ pulses:token ',' _ slots:token ')' {
  return { type:'euclid', value, pulses, slots }
}

token = (number / word / list)

// match polyrhtyhms and polymeters
list "list" = ( "[" / "{" ) _
body:pattern* _ delimiter:( "]" / "}" ) {
  body.type =  delimiter === ']' ? 'group' : 'polymeter'
  return body 
}

// match one or more tokens or expressions that does not 
// contain [], {}, or + - * /
word "word" = value:$[^ \[\] \{\} \(\) \t\n\r '*' '/' '+' '-']+ {
  return { type:typeof value, value }
}

// match tidal operators
op = '*' / '/' / '+' / '-'

// match a number, with or without decimals, positive or negative
// return value as number, not as string
number = "-"? (([0-9]+ "." [0-9]*) / ("."? [0-9]+)) {
  return { type:'number', value:+text() } 
}

// match zero or more whitespaces (tabs, spaces, newlines)
_ "whitespace" = [ \t\n\r ]*

