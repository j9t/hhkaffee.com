const { series, src, dest, watch } = require('gulp');
const gulpAutoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const sass = require('gulp-sass');

const config = {
  SASS_SOURCE_DIR: './source/setup/sass/**/*.{sass,scss}',
  SASS_SOURCES: [
    './source/setup/sass/**/*.{sass,scss}',
  ],
  SASS_OUT_DIR: './source/setup/'
};

function compileSass(cb) {
  src(config.SASS_SOURCE_DIR)
    .pipe(sass({
      outputStyle: 'compressed'
    })).on('error', sass.logError)
    .pipe(rename(function(path) {
      path.basename += '.min';
    }))
    .pipe(gulpAutoprefixer())
    .pipe(dest(config.SASS_OUT_DIR));

  cb();
}

function watchSass() {
  watch(config.SASS_SOURCES, compileSass);
}

exports.sass = compileSass;
exports.watch = watchSass;
exports.build = compileSass;
exports.default = series(compileSass, watchSass);
