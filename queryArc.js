const Fraction = require( 'fraction.js' )
const PQ       = require( 'priorityqueue' )
const util     = require( 'util' )
const log      = util.inspect

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
const calculateDuration = ( phase, phaseIncr, end ) => phase + phaseIncr <= end ? phaseIncr : end.sub( phase )

// get an index number for a pattern for a particular phase
const getIndex = ( pattern, phase ) => {
  let idx = 0
  if( pattern.options !== undefined ) {
    if( pattern.options.overrideIncr === true ) {
      idx = phase.div( pattern.options.incr ).mod( pattern.values.length ).floor()
    }
  }else{
    // default list behavior
    idx = phase.mul( Fraction( pattern.values.length ) ).mod( pattern.values.length ).floor()
  }

  return idx.valueOf()
}

// in addition to 'fast', phase resets are also necessary when indexing subpatterns,
// which are currently arrays with no defined .type property, hence the inclusion of
// undefined in the array below
const shouldResetPhase = [ 'fast', undefined, 'group' ] 

// XXX does these need to look at all parents recursively? Right now we're only using one generation...
const shouldReset = pattern => {
  const reset = shouldResetPhase.indexOf( pattern.type ) > -1 
  const parent = pattern.parent !== undefined && shouldResetPhase.indexOf( pattern.parent.type ) > -1

  return reset && parent
}

const shouldNotRemap = ['polymeter']
const shouldRemap = pattern => shouldNotRemap.indexOf( pattern.type ) === -1

// if an event is found that represents a pattern (as opposed to a constant) this function
// is called to query the pattern and map any generated events to the appropriate timespan
const processPattern = ( pattern, duration, phase, phaseIncr=null, override = null, shouldRemapArcs=true ) => {
  if( phaseIncr === null ) phaseIncr = duration.clone()

  let events = handlers[ pattern.type]( 
    [], 
    pattern, 
    shouldReset( pattern ) === true ? Fraction(0) : phase.clone(), 
    duration.div( phaseIncr ), 
    override, 
    false
  )

  // if needed, remap arcs for events
  if( shouldRemapArcs === true ) {
    events = events.map( v => ({
      value: v.value,
      arc: getMappedArc( v.arc, phase.clone(), phaseIncr )
    }) )
  }
 
  return events 
}

const handlers = {
  group( eventList, pattern, phase, duration, overrideIncr=null, init=true ) {
    const start     = phase.clone(),
          end       = start.add( duration ),
          phaseIncr = overrideIncr === null 
            ? pattern.type === 'polymeter'
              ? Fraction( 1, pattern.left.values.length )
              : Fraction( 1, pattern.values.length ) 
            : overrideIncr
          
    // get phase offset if scheduling begins in middle of event arc
    if( init === true ) phase = adjustPhase( phase, phaseIncr, end )

    // round up duration, we'll discard events outside of the current arc
    // at the end of this function
    duration = Fraction( Math.ceil( duration.valueOf() ) )

    console.log( pattern.type, phase.toFraction(), phaseIncr.toFraction(), duration.toFraction(), pattern.values.length )
    
    while( phase.compare( end ) < 0 ) {
      // if pattern is a list, read using current phase, else read directly
      const member = Array.isArray( pattern.values ) === true 
        ? pattern.values[ getIndex( pattern, phase ) ] 
        : pattern.value

      // get duration of current event being processed
      const dur = calculateDuration( phase, phaseIncr, end )

      // if value is not a numeric or string constant (if it's a pattern)...
      if( member === undefined || isNaN( member.value ) ) {
        // query the pattern and remap time values appropriately 
        if( member !== undefined ) member.parent = pattern
        const events = processPattern( member, dur, phase.clone(), phaseIncr, null, shouldRemap( member ) )
        eventList = eventList.concat( events )
      }else{
        eventList.push({ 
          value:member.value, 
          arc:Arc( phase, phase.add( dur ) ),
        })
        console.log( member.value, phase.toFraction(), phase.add( dur ).toFraction() )
      }

      // assuming we are starting / ending at a regular phase increment value...
      if( phase.mod( phaseIncr ).valueOf() === 0 ) {
        phase = advancePhase( phase, phaseIncr, end )
      }else{
        // advance phase to next phase increment
        phase = phase.add( phaseIncr.sub( phase.mod( phaseIncr ) ) ) 
      }
    }

    // prune any events that fall before our start phase or after our end phase
    eventList = eventList.filter( evt => {
      return evt.arc.start.valueOf() >= start.valueOf() && evt.arc.start.valueOf() < end.valueOf()
    })

    // XXX should this be applied everytime queryArc is called? maybe it should only be applied
    // at the top-most level, which would require a wrapper function...
    //.map( evt => {
    //  evt.arc.start = evt.arc.start.sub( start )
    //  evt.arc.end   = evt.arc.end.sub( start )
    //  return evt
    //})
   
    return eventList
  },
  polymeter( state, pattern, phase, duration ) {
    pattern.left.parent = pattern.right.parent = pattern

    const incr  = Fraction( 1, pattern.left.values.length )
    const left  = processPattern( pattern.left, duration, phase.clone(), incr, incr, false )

    pattern.right.options = { overrideIncr: true, incr }
    const right = processPattern( pattern.right, duration, phase.clone(), incr, incr, false ) 

    return state.concat( left ).concat( right )
  },

  speed( state, pattern, phase, duration ) {
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
        Fraction(speed)
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
        evt.arc.start.compare( incr.mul(i+1) ) < 0 
      )
      // add to previous events
      .concat( events )
    }
    return state.concat( events )
  },

  // doesn't appear to work for subpatterns
  slow( state, pattern, phase, duration ) {
    // see 'fast' pattern type of implementation notes
    const speeds = queryArc( [], pattern.speed, Fraction(0), Fraction(1) )
    
    let events = []
    const incr  = Fraction(1, speeds.length)
    for( let i = 0; i < speeds.length; i++ ) {
      const speed = speeds[ i ].value

      // adjust phase and duration based on speed value
      events = queryArc( 
        [],
        pattern.values,
        phase.mul( speed ),
        duration.mul( Fraction( speed ) )
      )
      // remap events to correct time spans
      .map( evt => {
        if( evt.arc.start.valueOf() !== 0 ) {
          // XXX I don't know why this is necessary but it gets rid of a off-by-one error
          evt.arc.start = evt.arc.start.sub( phase.div( 1/speed ) )
        }

        // also, does the event length need to be adjusted? might as well...
        evt.arc.end = evt.arc.end.sub( phase.div( 1/speed ) ).add( 1/speed - 1)

        return evt
      })
      // remove events don't fall in the current window
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

const queryArc = function( pattern, phase, duration, overrideIncr=null, init=true ) {
  const start     = phase.clone(),
        end       = start.add( duration )

  const eventList = processPattern( 
    pattern, 
    duration, 
    phase.clone(), 
    null, 
    null, 
    shouldRemap( pattern ) 
  )
  // prune any events that fall before our start phase or after our end phase
  .filter( evt => {
    return evt.arc.start.valueOf() >= start.valueOf() && evt.arc.start.valueOf() < end.valueOf()
  })

  // XXX should this be applied everytime queryArc is called? maybe it should only be applied
  // at the top-most level, which would require a wrapper function...
  //.map( evt => {
  //  evt.arc.start = evt.arc.start.sub( start )
  //  evt.arc.end   = evt.arc.end.sub( start )
  //  return evt
  //})
 
  return eventList
}

//events = queryArc( [], 
//  { values: [ { type:'number', value:0 }, { type:'number', value:1 }], type:'group' },
//  Fraction(0),
//  Fraction(1)
//)

//const fastpattern = {
//  values:[0],
//  type: 'speed',
//  speed: [2,3,4,8]
//}

//const slowpattern = {
//  values:[0],
//  type: 'slow',
//  speed: [ Fraction(1,3) ] 
//}

//let events

//events = queryArc( 
//  [], 
//  { 
//    type:'group', 
//    values:[
//      { type:'number', value:0 },
//      { type:'group', values:[
//        { type:'number', value:1 },
//        { type:'number', value:2 }
//      ]}
//    ]
//  }, 
//  Fraction(0), 
//  Fraction(1) 
//)

//events = queryArc( 
//  [], 
//  { 
//    type:'group', 
//    values:[
//      { type:'number', value:0 },
//      { type:'group', values:[
//        { type:'number', value:1 },
//        { type:'number', value:2 },
//        { type:'group', values:[
//          { type:'number', value:3 },
//          { type:'number', value:4 }
//        ]}
//      ]}
//    ]
//  }, 
//  Fraction(0), 
//  Fraction(1) 
//)

//events = queryArc( [], fastpattern, Fraction(0), Fraction(1) )
//events = queryArc( [], slowpattern, Fraction(0), Fraction(15) )

//events = queryArc( 
//  [], 
//  {
//    type:'group',
//    values:[{ 
//      type:'polymeter', 
//      left: { type:'group', values:[{ type:'number', value:0 },{ type:'number', value:1 }] }, 
//      right:{ type:'group', values:[{ type:'number', value:2 },{ type:'number', value:3 }, { type:'number', value:4 }] } 
//    }],
//  }, 
//  Fraction(0), Fraction(2) 
//)
events = queryArc( 
    { 
      type:'polymeter', 
      left: { type:'group', values:[{ type:'number', value:0 },{ type:'number', value:1 }] }, 
      right:{ type:'group', values:[{ type:'number', value:2 },{ type:'number', value:3 }, { type:'number', value:4 }] } 
    },
  Fraction(0), Fraction(2) 
)

PQ({
  comparator: ( a,b ) => a.arc.start.compare( b.arc.start ) 
})
.from( events )
.toArray()
.forEach( v => 
  console.log( 
    `${v.arc.start.toFraction()} - ${v.arc.end.toFraction()}: [ ${v.value.toString()} ]` 
  ) 
)

module.exports = queryArc
