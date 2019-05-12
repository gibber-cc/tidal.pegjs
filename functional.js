const Fraction = require( 'fraction.js' )
const PQ       = require( 'priorityqueue' )

const makePolymeter = function( pattern, phaseOffset=null ) {

  //let phase = phaseOffset === null ? Fraction(0) : phaseOffset

  const polymeter = function( state, offset, duration ) {
    const start = offset.clone(),
          timePerStep = Fraction( 1, pattern.left.length ),
          lengthDiff  = Fraction( 1, pattern.right.length ).div( Fraction( 1,  pattern.left.length ) ),
          end = start.add( duration )

    let phase = offset.clone()
    console.log( 'phase:', phase.toFraction(), end.toFraction(), duration.toFraction() )
    while( phase.compare( end ) < 0 ) {
      const timeUntilNextEvent = phase.clone()

      if( timeUntilNextEvent.compare( end ) <= 0  ) {
        const leftPhase  = phase.mul( Fraction( pattern.left.length ) )
        const rightPhase = phase.mul( lengthDiff ).mul( Fraction( pattern.right.length ) )

        state.push({ 
          time:  timeUntilNextEvent,
          value:[
            pattern.left[  Math.floor( leftPhase )  % pattern.left.length  ],
            pattern.right[ Math.floor( rightPhase ) % pattern.right.length ]
          ]
        })
      }

      if( phase.add( timePerStep ).compare( end ) >= 0 ) {
        phase = end
        break
      }else{
        phase = phase.add( timePerStep )
      }

    }

    return state
  }

  return polymeter
}

const makeList = function( pattern ) {
  const list = function( state, offset, duration ) {
    const start = offset,
          timePerStep = Fraction( 1, pattern.length ),
          end = start.add( duration ),
          stepMod = start.mod( timePerStep).valueOf() === 0 ? 0 : start.div( timePerStep ).floor().add(1),
          startPhase = stepMod

    let phase = timePerStep.mul( stepMod ).sub( start )
    
    while( phase.compare( duration ) < 0 ) {
      const timeUntilNextEvent = phase.clone() 

      let percentRemaining = Fraction(1)
      if( phase.add( timePerStep ).compare( end ) >= 0 ) {
        percentRemaining = end.sub( phase ).div( end )
      }

      if( timeUntilNextEvent.compare( duration ) <= 0  ) {
        const idx = phase.add( start ).mul( Fraction( pattern.length ) ).mod( pattern.length ).floor()
        let value = pattern[ idx.valueOf() ]

        // if a value is another pattern, call into and concat the result into our state
        if( typeof value === 'function' ) {
          state = state.concat( 
            value( [], phase, percentRemaining ).map( function( v ) {
              const obj = { 
                time:v.time.mul( timePerStep ),//.add( phase ), 
                'value':v.value 
              }
              return obj
            })
          )
        }else{
          state.push({ 
            time:  timeUntilNextEvent,
            value
          })
        }
      }

      if( phase.add( timePerStep ).compare( end ) >= 0 ) {
        phase = end
        break
      }else{
        phase = phase.add( timePerStep )
      }
    }

    return state
  }

  return list
}

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

// if an event is found that represents a pattern (as opposed to a constant) this function
// is called to query the pattern and map any generated events to the appropriate timespan
const processPattern = ( pattern, duration, phase, phaseIncr, override = null, shouldRemapArcs=true ) => {
  const patternFunc = Array.isArray( pattern ) ? queryArc : handlers[ pattern.type ]
  const patternEvents = patternFunc( [], pattern, phase.clone(), duration.div( phaseIncr ), override, false )
  const mappedPatternEvents = patternEvents.map( v => ({
    value: v.value,
    arc: shouldRemapArcs === true ? getMappedArc( v.arc, phase.clone(), phaseIncr ) : v.arc
  }) )

  return mappedPatternEvents
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

const shouldNotRemap = ['polymeter']
const shouldRemap = pattern => shouldNotRemap.indexOf( pattern.type ) === -1

const handlers = {
  polymeter( state, pattern, phase, duration ) {
    const incr  = Fraction( 1, pattern.left.length )
    const left  = processPattern( pattern.left, duration, phase.clone(), Fraction(1,pattern.left.length ), incr, false )

    pattern.right.options = { overrideIncr: true, incr }
    const right = processPattern( pattern.right, duration, phase.clone(), Fraction(1,pattern.left.length ), incr, false )

    return state.concat( left ).concat( right )
  },
}

const polymeter = function( state, pattern, phase, duration, overrideIncr=null, init=true ) {
  phase = phase.clone()
  const start     = phase.clone(),
        end       = start.add( duration ),
        phaseIncr = overrideIncr === null ? Fraction( 1, pattern.length ) : overrideIncr
        
  // get phase offset if scheduling begins in middle of event arc
  if( init === true ) phase = adjustPhase( phase, phaseIncr, end )

  while( phase.compare( end ) < 0 ) {
    const idx   = getIndex( pattern, phase ) 
    const value = pattern[ idx.valueOf() ]

    // get duration of current event being processed
    const dur   = calculateDuration( phase, phaseIncr, end )

    // if value is not a constant (if it's a pattern)...
    if( isNaN( value ) ) {
      // query the pattern and remap time values appropriately 
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

const queryArc = function( state, pattern, phase, duration, overrideIncr=null, init=true ) {
  phase = phase.clone()
  const start     = phase.clone(),
        end       = start.add( duration ),
        phaseIncr = overrideIncr === null ? Fraction( 1, pattern.length ) : overrideIncr
        
  // get phase offset if scheduling begins in middle of event arc
  if( init === true ) phase = adjustPhase( phase, phaseIncr, end )

  while( phase.compare( end ) < 0 ) {
    const idx   = getIndex( pattern, phase ) 
    const value = pattern[ idx.valueOf() ]

    // get duration of current event being processed
    const dur   = calculateDuration( phase, phaseIncr, end )

    // if value is not a constant (if it's a pattern)...
    if( isNaN( value ) ) {
      // query the pattern and remap time values appropriately 
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

//const events = queryArc( [], [{ type:'polymeter', left:[0], right:[1,2,3] }], Fraction(0), Fraction(4) )
const events = queryArc( [], [0,[1,2]], Fraction(0), Fraction(1) )

const queue = new PQ({
  comparator: ( a,b ) => b.arc.start.compare( a.arc.start ) 
})

queue.from( events )
queue.collection.forEach( v => console.log( `${v.arc.start.toFraction()}-${v.arc.end.toFraction()}: [ ${v.value.toString()} ]` ) )
