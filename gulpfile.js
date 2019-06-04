const gulp = require('gulp');

// Contains all plugins the project depends on
const plugins = require('gulp-load-plugins')();


// Generate the peg from the grammar
function generatePeg() {
  return gulp.src('src/tidal.pegjs')
    .pipe(gulp.dest('dist')) // Add the tidal.pegjs file to dist to do everything in the same directory
    .pipe(plugins.pegjs({format: 'commonjs'}))
    .pipe(gulp.dest('dist'));
}


// Concatenate the flatten.js file with the generated peg
function flatten(){
  return gulp.src(['dist/tidal.js', 'src/flatten.js'])
    .pipe(plugins.concat('peg-parse-flatten.js'))
    .pipe(gulp.dest('dist'));
}


// Run tests
function runTests(){
  return gulp.src('test/*.js', {read:false})
    .pipe(plugins.mocha({ reporter:'nyan'}));
}


// Watch for changes in the peg, any js file or any test file and run tests
function watchFiles(){
  gulp.watch('./src/*', gulp.series('test'));
  gulp.watch('./test/*', gulp.series('test'));
}


// Clean everything that was made with gulp
function clean(){
  return gulp.src('dist/*', {read: false})
    .pipe(plugins.clean())

}

// Task definitions
gulp.task('build', generatePeg);
gulp.task('flatten', gulp.series('build', flatten));
gulp.task('test', gulp.series('flatten', runTests));
gulp.task('watch', watchFiles);
gulp.task('clean', clean);
gulp.task('default', gulp.series('build'));
