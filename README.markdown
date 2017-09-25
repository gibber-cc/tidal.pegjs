# tidal.pegjs

`tidal.pegjs` is a parsing expression grammar for the [TidalCycles pattern language](https://tidalcycles.org/patterns.html), written using [PEG.js](http://pegjs.org). The goal of the PEG is to easily translate strings of Tidal patterns into annotated JavaScript data structures for use in sequencing.

## Usage
By default the file exports a global named `Tidal` that has a `parse` method for parsing patterns.

```html
<!doctype html>
<html lang='en'>
  <head>
    <script src='./tidal.js'></script>
  </head>
  <body></body>
  <script>
    const test = Tidal.parse( '0 1 2' )
    console.log( test ) 
    /*
    outputs:
     [ 
       { type:'number', value:0 },
       { type:'number', value:1 },
       { type:'number', value:2 },
       type:'pattern' 
     ]
    */
  </script>
</html>
```

If you'd like to use JS modules of some type instead of a global, see the development section.

## Parsing
Below are a couple of simple examples of what the parser outputs:

`0 2 4 6` => `[ 0, 2, 4, 6, type: 'pattern' ]`

`0 [[2 3] [2 4(3,8) 7*2]] 5` =>

```js
[
  { type:'number', value:0 }, 
  [
    [ 
      { type:'number', value:2 }, { type:'number', value:3 }, type:'group' 
    ],
    [
      { type:'number', value:2 }, 
      {
        "type": "euclid",
        "value":  { type:'number', value:4 },
        "pulses": { type:'number', value:3 },
        "slots":  { type:'number', value:8 }
      }, 
      {
        "type": "binop",
        "left": { type:'number', value:7 },
        "op":   "*",
        "right":{ type:'number', value:2 } 
      },
      type:'group'
    ],
    type:'group'
  ], 
  { type:'number', value:5 },
  type:'pattern'
]

```

## Development

### Installing dependencies
I havne't done any work making this tidy yet, but will try to do so soon. For now, installing the dependencies can be done with:

```
npm install pegjs -g
```

For testing you'll also need `npm install mocha -g`

### Compiling the parser

To compile the parser into a JS module, use `pegjs tidal.pegjs` in the top-level directory of this repo. This will create a file named `tidal.js` that can be required as a module in Node.js or in the browser using browserify etc.

To compile the parser as a global variable: `pegjs --format globals --export-var Tidal tidal.pegjs`.

For more instructions on compiling parsers, see https://pegjs.org/documentation#generating-a-parser-javascript-api.

### Testing

Tests are done with Mocha, you'll need to have it installed globally. You should also have peg.js installed locally:

`npm install pegjs`

Then run `mocha` from the top-level directory to run the parsing tests. Eventually I'll setup a gulpfile to run these tests automatically whenever changes to the parser / tests are made.

## More about PEGs and musical programming languages
Graham Wakefield and I ran [a workshop on using PEGs to create musical programming languages](http://worldmaking.github.io/workshop_nime_2017/); check it out for more about how PEGs work and tutorials on creating your own mini-languages.
