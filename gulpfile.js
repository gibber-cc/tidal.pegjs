var gulp = require('gulp');

// Contains all plugins our projects depends on
var plugins = require('gulp-load-plugins')();


// Clean the dist folder
gulp.task('clean', function(){
  return gulp.src('dist/*')
      .pipe(plugins.clean({force: true}))
});


// Parse only
function parse(){

  // Add concatenated files to the dist folder
  gulp.src(['./src/tidal.js', './src/parseToObject.js'])
    .pipe(plugins.concat('peg-parse.js'))
    .pipe(gulp.dest('dist'));

  // Add the peg file to the dist folder with new path to the parse file
  gulp.src('./src/tidal.pegjs')
    .pipe(plugins.replace(/.*\parseToObject.js$/g, '$1foo')) // TODO: this does nothing and figure out what the path is
    .pipe(gulp.dest('dist'))

  // Add the tests to the dist folder
  gulp.src(['./test/*.js', '!./test/*flatten.js'])
    .pipe(gulp.dest('dist/test'))

}
gulp.task(parse)


// Parse and flatten
function parse_flatten(){

  // Add concatenated files to the dist folder
  gulp.src(['./src/tidal.js', './src/flatten.js'])
    .pipe(plugins.concat('peg-parse.js'))
    .pipe(gulp.dest('dist'));

  // Add the peg file to the dist folder with new path to the parse file
  gulp.src('./src/tidal.pegjs')
    .pipe(plugins.replace(/.*\parseToObject.js$/g, '$1foo')) // TODO: this does nothing and figure out what the path is
    .pipe(gulp.dest('dist'))

  // Add the tests to the dist folder
  gulp.src(['./test/*.js'])
    .pipe(gulp.dest('dist/test'))

}
gulp.task(parse_flatten)


// Watch task for automatic update
gulp.task('watch', function(){

  return gulp.watch('./src/parseToObject.js', gulp.series('parse'));

  // // Build the peg file
  // plugins.watch('./src/tidal.js', function(){
  //   return gulp.parallel('peg-compile')
  // })
  //
  // // Build the parse.js file
  // plugins.watch('./src/parse.js', function(){
  //   return gulp.parallel('parse-compile')
  // })
  //
  // // Build the flatten.js file
  // plugins.watch('./src/flatten.js', function(){
  //   return gulp.parallel('flatten-compile')
  // })

});


// Default task cleans and triggers watch task
gulp.task('default', function () {
  return gulp.src('dist/*')
      .pipe(plugins.clean({force: true}))
});
