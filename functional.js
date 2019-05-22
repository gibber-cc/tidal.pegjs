const Fraction = require( 'fraction.js' )
const PQ       = require( 'priorityqueue' )
const util     = require( 'util' )
log = util.inspect

// placeholder for potentially adding more goodies (parent arc etc.) later
const Arc = ( start, end ) => ({ start, end })

// map arc time values to appropriate durations
const getMappedArc = ( arc, phase, phaseIncr ) => {
  let mappedArc
  
  if( phase.mod( phaseIncr ).valueOf() !== 0 ) {
    mappedArc = Arc( 
      arc.start.mul( phaseIncr ).add( phase ), 
      arc.end.mul( phaseIncr ).add( phaseIncr.mod( phase ) ) 
    )
  }else{
    mappedArc = Arc( 
      arc.start.mul( phaseIncr ).add( phase ), 
      arc.end.mul( phaseIncr ).add( phase ) 
    )
  }
  
  return mappedArc
}

// if initial phase is in the middle of an arc, advance to the end by calculating the difference
// between the current phase and the start of the next arc, and increasing phase accordingly.
const adjustPhase = ( phase, phaseIncr, end ) => phase.valueOf() === 0 
  ? Fraction(0) 
  : phase.sub( phase.mod( phaseIncr ) )

// check to see if phase should advance to next event, or, if next event is too far in the future, to the
// end of the current duration being requested.
const advancePhase = ( phase, phaseIncr, end ) => phase + phaseIncr <= end ? phase.add( phaseIncr ) : end 

// calculate the duration of the current event being processed.
const calculateDuration = ( phase, phaseIncr, end ) => phaseIncr//phase + phaseIncr <= end ? phaseIncr : end.sub( phase )

// get an index number for a pattern for a particular phase
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

const shouldNotResetPhase = [ 'polymeter' ]
// XXX does these need to look at all parents recursively? Right now we're only using one generation...
const shouldReset = pattern => {
  const reset = shouldNotResetPhase.indexOf( pattern.type ) === -1 
  const parent = pattern.parent !== undefined && shouldNotResetPhase.indexOf( pattern.parent.type ) === -1

  return reset && parent
}

const shouldNotRemap = ['polymeter']
const shouldRemap = pattern => shouldNotRemap.indexOf( pattern.type ) === -1

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

  // if needed, remap arcs for events
  const mapped = patternEvents.map( v => ({
    value: v.value,
    arc: shouldRemapArcs === true ? getMappedArc( v.arc, phase.clone(), phaseIncr ) : v.arc,
    triggered:v.triggered
  }) )

  return mapped
}


const handlers = {
  polymeter( state, pattern, phase, duration ) {
    pattern.left.parent = pattern.right.parent = pattern

    const incr  = Fraction( 1, pattern.left.length )
    const left  = processPattern( pattern.left, duration, phase.clone(), Fraction(1,pattern.left.length ), incr, false )

    pattern.right.options = { overrideIncr: true, incr }
    const right = processPattern( pattern.right, duration, phase.clone(), Fraction(1,pattern.left.length ), incr, false )

    return state.concat( left ).concat( right )
  },

  repetition( state, pattern, phase, duration ) {
    const speeds = queryArc( [], pattern.speed, Fraction(0), Fraction(1) )
    // the general process of increasing the speed of a pattern is to query
    // for a longer duration according to the speed, and the scale the resulting
    // events.
    
    // following explanation from yaxu for how subpatterns work with rates...
    // https://talk.lurk.org/channel/tidal?msg=z5ck73H9EvxQwMqq6 
    // re: pattern a*[2 4 8]
    // "Anyway what happens in this kind of situation is that it splits the cycle in three, 
    // each a window on what would have happened if you'd have sped things up by the given number
    // so for the first third you'd get a third of two a's
    // for the second third you'd get the second third of four a's..."
    
    let events = []
    const incr  = Fraction(1, speeds.length)
    for( let i = 0; i < speeds.length; i++ ) {
      const speed = speeds[ i ].value

      events = queryArc( [],
        pattern.values,
        Fraction( 0 ), 
        Fraction( speed ) // extend duration based on current speed
      )
      // remap events to correct time spans
      .map( evt => {
        evt.arc.start = evt.arc.start.div( speed )
        evt.arc.end   = evt.arc.end.div( speed )
        return evt
      })
      // remove events don't fall  in the current window
      .filter( evt => 
        evt.arc.start.compare( incr.mul(i) ) >= 0 && 
        evt.arc.start.compare( incr.mul(i+1) ) <= 0 
      )
      // add to previous events
      .concat( events )
    }
    return state.concat( events )
  }
}

const queryArc = function( state, pattern, phase, duration, overrideIncr=null, init=true ) {
  const start     = phase.clone(),
        end       = start.add( duration ),
        phaseIncr = overrideIncr === null ? Fraction( 1, pattern.length ) : overrideIncr
        
  // get phase offset if scheduling begins in middle of event arc
  if( init === true ) phase = adjustPhase( phase, phaseIncr, end )

  // round up duration, we'll discard events outside of the current arc
  // at the end of this function
  duration = Fraction( Math.ceil( duration.valueOf() ) )

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
    const dur = calculateDuration( phase, phaseIncr, end )

    // if value is not a constant (if it's a pattern)...
    if( isNaN( value ) ) {
      // query the pattern and remap time values appropriately 
      value.parent = pattern
      const events = processPattern( value, dur, phase.clone(), phaseIncr, null, shouldRemap( value ) )
      state = state.concat( events )
    }else{
      state.push({ 
        value, 
        arc:Arc( phase, phase.add( dur ) ),
        triggered:true 
      })
    }

    if( phase.mod( phaseIncr ).valueOf() === 0 ) {
      phase = advancePhase( phase, phaseIncr, end )
    }else{
      // advance phase to next phase increment
      phase = phase.add( phaseIncr.sub( phase.mod( phaseIncr ) ) ) 
    }
  }

  // prune any events that fall before our start phase or after our end phase
  state = state.filter( evt => {
    return evt.arc.start.valueOf() >= start.valueOf() && evt.arc.start.valueOf() <= end.valueOf()
  })

  return state
}

const fastpattern = {
  values:[0,1],
  type: 'repetition',
  speed: [1,2,4]
}

let events

//events = queryArc( [], [0,[1,2]], Fraction(0), Fraction(1) )
//events = queryArc( [], [ 0, [ 1,2, [3,4] ] ], Fraction(0), Fraction(1) )
//events = queryArc( [], { type:'polymeter', left:[0], right:[1,2,3] }, Fraction(0), Fraction(4) )
//events = queryArc( [], fastpattern3, Fraction(0), Fraction(1) )
events = queryArc( [], fastpattern, Fraction(0), Fraction(1) )

// starting at non-0 value
//events = queryArc( [], [0,[1,2]], Fraction(0), Fraction(.725) )

//console.log( log(events,{depth:3} ) ) 
const queue = new PQ({
  comparator: ( a,b ) => b.arc.start.compare( a.arc.start ) 
})

queue.from( events )

queue.collection.forEach( v => 
  console.log( 
    `${v.arc.start.toFraction()}-${v.arc.end.toFraction()}: [ ${v.value.toString()} ] ${v.triggered}` 
  ) 
)
