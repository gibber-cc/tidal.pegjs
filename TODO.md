TODO
===

- [ ] Fix code for polymeter, layer and onestep:
  - Tests require indexing 0 to get good output which is an issue when doing more nested patterns because things will get marked as groups redundantly
  - Potential solution: somewhere in the peg return only [0]

- [ ] Fix code for euclid and onestep:
  - The input for euclid could be something incorrect like: '60(1, 2)3)' and be parsed as '60(1,2,3)'
  - The input for onestep could be something incorrect like: '<1 2 3> 1 2 3>' and be parsed as '<1 2 3, 1 2 3>'
  - Potential solution: figure out how to write conditions for the syntax: if ',' we can have more things, if ')' nothing else can come after

- [ ] Fix parseFile path in the tidal.pegjs file:
  - It cannot be relative because after being compiled the tidal.pegjs file is in the compiled folder in the node modules: node_modules/pegjs/lib/compiler/index.js
  - Potential solution:

- [ ] Write parse task in Gulp:
  - [x] Add files to dist folder:
    - Concatenated tidal.js and parseToObject.js files into one file
    - The tidal.pegjs file
  - [ ] Change the parseFile path in the tidal.pegjs file to look at the concatenated file
    - Look into gulp-replace to replace the string with the path
    - Figure out how to find the path to the concatenated file
  - [x] Add test folder to the dist folder (without the flatten test)
  - [ ] For each file in the test file change the path for grammar to be the concatenated file
  - [ ] Run all tests in the test folder using mocha

- [ ] Write flatten task in Gulp:
  - [x] Add files to dist folder:
    - Concatenated tidal.js and flatten.js files into one file
    - The tidal.pegjs file
  - [ ] Change the parseFile path in the tidal.pegjs file to look at the concatenated file
    - Look into gulp-replace to replace the string with the path
    - Figure out how to find the path to the concatenated file
  - [x] Add test folder to the dist folder
  - [ ] For each file in the test file:
    - Change the path for grammar to be the concatenated file
    - Change the path to flattenFile in the flatten test to be the concatenated file
  - [ ] Run all tests in the test folder using mocha

- [ ] Write watch task in Gulp:
  - For any change in the flatten file run the flatten task
  - For any other change run the parse task
