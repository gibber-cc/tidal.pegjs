# tidal.pegjs

`tidal.pegjs` is a parsing expression grammar for the (TidalCycles pattern language)[https://tidalcycles.org/patterns.html], written using (PEG.js)[http://pegjs.org]. The goal of the PEG is to easily translate strings of Tidal patterns into annotated JavaScript data structures for use in sequencing.

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
  </script>
</html>
```

If you'd like to use JS modules of some type instead of a global, see the development section.

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

Tests are done with Mocha. With Mocha installed, run `mocha` from the top-level directory to run parsing tests.

Eventually I'll setup a gulpfile to run these tests automatically whenever changes to the parser / tests are made.
