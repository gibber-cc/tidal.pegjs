const Fraction = require( 'fraction.js' )
const PQ       = require( 'priorityqueue' )

const makeFast = function( pattern, speed ) {

  const fast = function( state, duration ) {
    // increase duration to grab more events, and then
    // map to faster speed / shorter duration
    const dur = Fraction( duration ).mul( speed )

    const __state = pattern( [], dur ).map( v => {
      const obj = {
        time:v.time.div( speed ),
        value:v.value
      }
      
      return obj
    })

    return state.concat( __state )
  }

  return fast
}


// placeholder for potentially adding more goodies (parent arc etc.) later
const Arc = ( start, end ) => ({ start, end })

// if initial phase is in the middle of an arc, advance to the end by calculating the difference
// between the current phase and the start of the next arc, and increasing phase accordingly.
const adjustPhase = ( phase, phaseIncr, end ) => phase.valueOf() === 0 ? Fraction(0) : phase.add( phaseIncr.sub( phase.mod( phaseIncr ) ) )

// check to see if phase should advance to next event, or, if next event is too far in the future, to the
// end of the current duration being requested.
const advancePhase = ( phase, phaseIncr, end )   => phase + phaseIncr <= end ? phase.add( phaseIncr ) : end 

// map arc time values to appropriate durations
const getMappedArc = ( arc, phase, phaseIncr ) => {
  return Arc( arc.start.mul( phaseIncr ).add( phase ), arc.end.mul( phaseIncr ).add( phase ) )
}

// calculate the duration of the current event being processed.
const calculateDuration = ( phase, phaseIncr, end ) => phase + phaseIncr <= end ? phaseIncr : end.sub( phase )

const getPattern = obj => {
  if( obj.values !== undefined ) obj = obj.values
  return obj
}

// if an event is found that represents a pattern (as opposed to a constant) this function
// is called to query the pattern and map any generated events to the appropriate timespan
const processPattern = ( pattern, duration, phase, phaseIncr, override = null, shouldRemapArcs=true ) => {
  const patternFunc = Array.isArray( pattern ) ? queryArc : handlers[ pattern.type ]

  const patternEvents = patternFunc( 
    [], 
    pattern, 
    shouldReset( pattern ) === true ? Fraction(0) : phase.clone(), 
    duration.div( phaseIncr ), 
    override, 
    false
  )
  .map( v => ({
    value: v.value,
    arc: shouldRemapArcs === true ? getMappedArc( v.arc, phase.clone(), phaseIncr ) : v.arc
  }) )

  return patternEvents 
}

const getIndex = ( pattern, phase ) => {
  let idx = 0
  if( pattern.options !== undefined ) {
    if( pattern.options.overrideIncr === true ) {
      idx = phase.div( pattern.options.incr ).mod( pattern.length ).floor()
    }
  }else{
    // default list behavior
    idx = phase.mul( Fraction( pattern.length ) ).mod( pattern.length ).floor()
  }

  return idx
}

const shouldNotResetPhase = ['polymeter']
// XXX does these need to look at all parents recursively? Right now we're only using one generation...
const shouldReset = pattern => {
  const reset = shouldNotResetPhase.indexOf( pattern.type ) === -1 
  const parent = pattern.parent !== undefined && shouldNotResetPhase.indexOf( pattern.parent.type ) === -1

  return reset && parent
}

const shouldNotRemap = ['polymeter']
const shouldRemap = pattern => shouldNotRemap.indexOf( pattern.type ) === -1

const handlers = {
  polymeter( state, pattern, phase, duration ) {
    pattern.left.parent = pattern.right.parent = pattern

    const incr  = Fraction( 1, pattern.left.length )
    const left  = processPattern( pattern.left, duration, phase.clone(), Fraction(1,pattern.left.length ), incr, false )

    pattern.right.options = { overrideIncr: true, incr }
    const right = processPattern( pattern.right, duration, phase.clone(), Fraction(1,pattern.left.length ), incr, false )

    return state.concat( left ).concat( right )
  },

  fast( state, pattern, phase, duration ) {
    const fastDuration = duration.mul( pattern.speed )
    const eventsSlow = processPattern( pattern.values, fastDuration, phase.clone(), Fraction(1,pattern.length) )
    const events = eventsSlow.map( evt => ({
      value:evt.value,
      arc:Arc( evt.arc.start.div( pattern.speed ), evt.arc.end.div( pattern.speed ) )
    }) )

    return state.concat( events )
  }
}

const queryArc = function( state, pattern, phase, duration, overrideIncr=null, init=true ) {
  const start     = phase.clone(),
        end       = start.add( duration ),
        phaseIncr = overrideIncr === null ? Fraction( 1, pattern.length ) : overrideIncr
        
  // get phase offset if scheduling begins in middle of event arc
  if( init === true ) phase = adjustPhase( phase, phaseIncr, end )

  while( phase.compare( end ) < 0 ) {
    let value

    // handle processing non-list patterns from top level
    if( Array.isArray( pattern ) ) {
      const idx = getIndex( pattern, phase ) 
      value = pattern[ idx.valueOf() ]
    }else{
      value = pattern
    }

    // get duration of current event being processed
    const dur   = calculateDuration( phase, phaseIncr, end )

    // if value is not a constant (if it's a pattern)...
    if( isNaN( value ) ) {
      // query the pattern and remap time values appropriately 
      value.parent = pattern
      const events = processPattern( value, dur, phase.clone(), phaseIncr, null, shouldRemap( value ) )
      state = state.concat( events )
    }else{
      state.push({ 
        value, 
        arc:Arc( phase, phase.add( dur ) ) 
      })
    }

    phase = advancePhase( phase, phaseIncr, end )
  }
  return state
}

// simulates '8 0 {0 1, 2 3 4}*2'
//const pm   = makePolymeter({ left:[0,1], right:[2,3,4] })
//const list = makeList( [ 8,9, makeFast( pm, 2 )  ] )
//const list = makeList( [ 8,9, pm  ] )
//const list = makeList([ 0,1,2,3 ])

//const list = makeList( [ 0, makeList([1,2]), 3 ] )
//const events = list( [], Fraction(0), Fraction(3.1) )

let events

//events = queryArc( [], [0,[1,2]], Fraction(0), Fraction(1) )
//events = queryArc( [], [0,[1,2,[3,4]]], Fraction(0), Fraction(1) )
//events = queryArc( [], { type:'polymeter', left:[0], right:[1,2,3] }, Fraction(0), Fraction(4) )

const fp = {
  values:[ 2,3 ],
  type: 'fast',
  speed: 16
}

events = queryArc( [], fp, Fraction(0), Fraction(1,2) )

const queue = new PQ({
  comparator: ( a,b ) => b.arc.start.compare( a.arc.start ) 
})

queue.from( events )
queue.collection.forEach( v => console.log( `${v.arc.start.toFraction()}-${v.arc.end.toFraction()}: [ ${v.value.toString()} ]` ) )
