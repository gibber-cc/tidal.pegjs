const Fraction = require( 'fraction.js' )
const PQ       = require( 'priorityqueue' )

const makePolymeter = function( pattern, phaseOffset=null ) {

  let phase = phaseOffset === null ? Fraction(0) : phaseOffset

  const polymeter = function( state, duration ) {
    const start = phase.clone(),
          timePerStep = Fraction( 1, pattern.left.length ),
          lengthDiff  = Fraction( 1, pattern.right.length ).div( Fraction( 1,  pattern.left.length ) ),
          end = start.add( duration )

    //console.log( 'phase:', phase.toFraction(), end.toFraction() )
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
  const list = function( state, duration ) {
    const start = Fraction(0),
          timePerStep = Fraction( 1, pattern.length ),
          end = start.add( duration ),
          stepMod = start.mod( timePerStep).valueOf() === 0 ? 0 : start.div( timePerStep ).floor().add(1),
          startPhase = stepMod

    let phase = timePerStep.mul( stepMod ).sub( start )
    
    while( phase.compare( duration ) < 0 ) {
      const timeUntilNextEvent = phase.clone() 

      if( timeUntilNextEvent.compare( duration ) <= 0  ) {
        const idx = phase.add( start ).mul( Fraction( pattern.length ) ).mod( pattern.length ).floor()
        let value = pattern[ idx.valueOf() ]

        // if a value is another pattern, call into and concat the result into our state
        if( typeof value === 'function' ) {
          state = state.concat( 
            value( [], 1 ).map( function( v ) {
              const obj = { 
                time:v.time.mul( timePerStep ).add( phase ), 
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

      phase = phase.add( timePerStep )
    }

    return state
  }

  return list
}

const makeFast = function( pattern, speed ) {
  const fast = function( state, duration ) {
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


// simulates '8 0 {0 1, 2 3 4}*2'
const pm   = makePolymeter({ left:[0,1], right:[2,3,4] })
const list = makeList( [ 8,9, makeFast( pm, 2 )  ] )
const events = list( [], Fraction(3.1) )

const queue = new PQ({
  comparator: ( a,b ) => b.time.compare( a.time ) 
})

queue.from( events )
queue.collection.forEach( v => console.log( `${v.time.toFraction()}: [ ${v.value.toString()} ]` ) )

/*
polymeter( {}, 0, 2 )

'1 2*4 3'

list(
  constant( 1 ),
  list( [2,3,4] ),
  constant(5),
  polymeter( [6,7], [8,9,10] )
)

queryArc( {}, 0, 1 )
  // constant( {}, )

// every function
1. accepts state, starting phase, duration
2. calls function aligned with occupying current phase
  - passes in a *relative* phase and duration to the position in the containing pattern, not
    absolute values
3. each function knows

pattern = '0 [1 2] 3'

state = {}
list( state, 0, 1 )
  -> constant( state, 0, 1/3, 1/3 )
  -> list( state, 1/3, 1/3 )
     -> constant( state, 1/3, 1/6 )
     -> constant( state, 1/2, 1/6 )
  -> constant( state, 2/3, 1/3 )
*/




