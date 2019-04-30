TODO
===

- [ ] Fix code for polymeter, layer and onestep:
  - Tests require indexing 0 to get good output which is an issue when doing more nested patterns because things will get marked as groups redundantly
  - Potential solution: somewhere in the peg return only [0]

- [ ] Fix code for euclid and onestep:
  - The input for euclid could be something incorrect like: '60(1, 2)3)' and be parsed as '60(1,2,3)'
  - The input for onestep could be something incorrect like: '<1 2 3> 1 2 3>' and be parsed as '<1 2 3, 1 2 3>'
  - Potential solution: figure out how to write conditions for the syntax: if ',' we can have more things, if ')' nothing else can come after



- Gulp logic makes sense but the way files are distributed originally does not, especially because I refer to things differently



  test
    - run tests

  watch
    - whenever tidal.pegjs changes or
      flatten.js changes, run gulp flatten


  if the PEG changes, run gulp.series( parser, flatten, test )
  if flatten.js changes, run gulp.series( flatten, test )
  if tests change, run test
