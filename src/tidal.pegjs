{
  const addLocations = options.addLocations
 
  let uid = 0
  const addLoc = function( value, location ) {
    if( addLocations === true ) {
      value.location = location
    }
    
    if( options.addUID === true ) {
      value.uid = uid++
    }

    return value
  }
}

// XXX the ordering here is very important... list must be before euclid, repeat etc.
pattern =  feet / list / repeat / layer / euclid /  group / onestep / polymeter / term 

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
 
  addLoc( out, location() )

  return out
}

// a group
group "group" = _ '[' _ values:term+ _ ']' _ {
  const out = {
    values,
    type:'group' 
  }
  
  return addLoc( out, location() ) 
}

// generic term for matching in groups
// XXX The ordering here is really important. For example, degrade needs to be parsed before
// number, otherwise the number is parsed and you're left with a ? This ordering passes all tests
// but might need to be tweaked.
term "term" = body:(
  repeat / degrade / layer / number / letters / word / polymeter / group /  euclid  / letter / rest / onestep
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
  const out = { type:'degrade', value }
  return addLoc( out, location() )
}
// avoid left-recursions
notdegrade = body:( number / repeat / euclid / group / letter / onestep ) _ { return body }


// match a binary operation, a la 4*2, or [0 1]*4
repeat = value:notrepeat _ operator:op  _ rate:notrepeat _ {
  const r =  { type:'repeat', operator, rate, value }

  if( options.addLocations === true ) {
    r.location = {
      start:value.location.start,
      end: rate.location.end
    }
  }
  
  // not needed anymore
  if( value.location !== undefined ) delete value.location
  if( rate.location !== undefined )  delete rate.location

  return r 
}
// avoid left-recursions; must parse number before letters!
notrepeat = body: (euclid / polymeter / number / layer / letters /group / letter / rest /onestep ) _ { return body }

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

  addLoc( result, location() )

  return result
}

// return a rest object
rest = '~' {
 return { type:'rest' }
}


// identifies an array of groups delimited by '.' characters
feet = start:foot+ end:notfoot {
  const out = {
    type:'group',
    values: start.map( grp => grp[0] )
  }
  out.values.push( end )

  return addLoc( out, location() )
}

// identifies a group delimited by a '.' character
foot = value:notfoot+ dot _ {
  return value
}
// avoid left-recursions
notfoot = list / degrade / polymeter / rest / repeat / euclid / number / letter / letters / word / onestep

// basically, get each list and push into an array while leaving out whitespace
// and commas
layer = _ '[' _ body:(notlayer _ ',' _ )+ end:notlayer _ ']' _ {
  const values = []

  for( let i = 0; i < body.length; i++ ) {
    let value = body[ i ][ 0 ]
    if( value.type === 'number' || value.type === 'string' ) {
      value = {
        type:'group',
        values:[ value ]
      }
    }else{
      /*value.type = 'group'*/
    }
  	values.push( value )
  }

  if( end.type === 'number' || end.type === 'string' ) {
    end = { type:'group', values:[ end ] }
  }else{
    /*end.type = 'group'*/
  }

  values.push( end )

  const result = {
    type: 'layers',
    values
  }

  return addLoc( result, location() )
}
//notlayer = body:( repeat / number ) _ { return body }
notlayer = body:( repeat / list / number / letters / euclid / polymeter / group / letter / rest / onestep) _ { return body }

// One-step
onestep = '<' _ body:notonestep ','? end:notonestep? _ '>' {
  const onestep = {
    type:'onestep',
    values:[body]
  }

  if( end !== null ) {
    onestep.values.push( end )
  }

  return addLoc( onestep, location() )
}

notonestep = body:(list / euclid / polymeter / word / group / number / letter /  rest / layer) _ { return body }

word "word" = _ value:$[letter number]+ _ { 
  return addLoc( { type:typeof value, value, }, location() )
}

letters = _ l:letter+ _ {
  return addLoc( { type:'string', value:text().trim() }, location() )
}

letter =  value:$[^ \[\] \{\} \(\) \t\n\r '*' '/' '.' '~' '?' ',' '>' '<' ]  {
  return addLoc( {type:'string', value }, location() )
}

// match tidal operators
op = ('*' / '/')
dot = '.'
question = '?'

number = "-"? (([0-9]+ "." [0-9]*) / ("."? [0-9]+))  {
  return addLoc( { type:'number', value:+text().trim() }, location() )
}

_ "whitespace" = [ \t\n\r ]*
