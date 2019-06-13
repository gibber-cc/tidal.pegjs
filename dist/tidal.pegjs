// XXX the ordering here is very important... list must be before euclid, repeat etc.
pattern =  list / euclid / repeat / layer / group / onestep / polymeter / term 

// a list (which is a group)
list = _ _valuesstart:term _ _valuesend:term+ _ {
  _valuesend.unshift( _valuesstart )
  const values = _valuesend

  let out
  
  if( values.type === undefined ) {
    // getting nested arrays with feet...
    out = {
      values:Array.isArray( values[0] ) ? values[0] : values,
      type:'group'
    }
  }else{
    out = values
    out.type = 'group'
  }
 
  return out
}

// a group
group "group" = _ '[' _ values:term+ _ ']' _ {
  const out = {
    values,
    type:'group'
  }
  
  return out 
}

// generic term for matching in groups
term "term" = body:(
  polymeter / layer / degrade / repeat / feet / group / euclid  / number / letter / word / rest / onestep 
) _ {return body}

// bjorklund
euclid = _ value:noteuclid '(' _ pulses:term ',' _ slots:term _ ')'? ','? _ rotation:term* _ ')'? {
  const result = {
    type:'bjorklund',
    pulses, 
    slots, 
    value,
    'rotation': rotation.length > 0 ? rotation[ 0 ] : null
  }

  return result
}
// avoid left-recursions
noteuclid = body:( group / number / letter /  word / rest / onestep) _ { return body }


// degrading individual values
degrade = value:notdegrade '?' {
  return { type:'degrade', value }
}
// avoid left-recursions
notdegrade = body:( repeat / euclid / group / number / letter / word / onestep) _ { return body }


// match a binary operation, a la 4*2, or [0 1]*4
repeat = value:notrepeat _ operator:op  _ rate:term {
  return { type:'repeat', operator, rate, value }
}
// avoid left-recursions
notrepeat = body:(euclid / polymeter / group / number / letter / word / rest /onestep) _ { return body }



polymeter = _ '{' _ left:term+ ',' _ right:term+ _ '}' _ {
  const result = { 
    'left':{
      type:'group',
      values:left
    }, 
    'right':{
      type:'group',
      values:right,
    },
    type: 'polymeter' 
  }

  return result
}

// return a rest object
rest = '~' {
 return { type:'rest' }
}


// identifies an array of groups delimited by '.' characters
feet = start:foot+ end:notfoot+ {
  const __end = {
    values:end,
    type:'group'
  }

  // some different wrangling for two feet vs. more than two feet...
  let values = start.length > 1 ? start.slice(0) : start[0],
      result
  
  if( start.length > 1 ) {
    result = values.map( v => ({ type: 'group', values:v }) )
  }else{
    result = [ { values, type:'group' } ]
  }
  
  result.push( __end )

  return { type:'group', values:result } 
}
// identifies a group delimited by a '.' character
foot = value:notfoot+ dot _ {
  //value.type = 'group'
  return value
}
// avoid left-recursions
notfoot = degrade / polymeter / rest / repeat / euclid / group / number / letter / word / onestep


// basically, get each list and push into an array while leaving out whitespace
// and commas
layer = _ '[' _ body:(notlayer _ ',' _ )+ end:notlayer _ ']'_ {
  const values = []

  for( let i = 0; i < body.length; i++ ) {
  	values.push( body[ i ][ 0 ] )
    values[ values.length - 1 ].type = 'group'
  }

  end.type = 'group'
  values.push( end )

  const result = {
    type: 'layers',
    values
  }

  return result
}
notlayer = body:(list / euclid / polymeter / group / number / letter / word / rest / onestep) _ { return body }


// One-step
onestep = '<' _ body:notonestep ','? end:notonestep? _ '>' {
  const onestep = {
    type:'onestep',
    values:[body]
  }

  if( end !== null ) {
    onestep.values.push( end )
  }

  return onestep 
}
notonestep = body:(list / euclid / polymeter / group / number / letter / word / rest / layer) _ { return body }

word "word" = _ value:$[letter number]+ _ {
  return { type:typeof value, value }
}

letter = _ value:$[^ \[\] \{\} \(\) \t\n\r '*' '/' '.' '~' '?' ',' '>' '<'] _ {
  return { type:'string', value }
}

// match tidal operators
op = ('*' / '/')
dot = '.'
question = '?'

number = _ "-"? (([0-9]+ "." [0-9]*) / ("."? [0-9]+)) _ {
  return { type:'number', value:+text() }
}

_ "whitespace" = [ \t\n\r ]*
