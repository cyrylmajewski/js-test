const { src, dest, parallel, series, watch } = require('gulp');
// html
const fileinclude   = require('gulp-file-include');
// sass
const autoprefixer  = require('gulp-autoprefixer');
const sass          = require('gulp-sass');
const sassGlob      = require('gulp-sass-glob');
const csso          = require('gulp-csso');
const sourcemaps    = require('gulp-sourcemaps');
// js
const uglify        = require('gulp-uglify');
const babel         = require('gulp-babel');
const concat        = require('gulp-concat');
// images
const imagemin      = require('gulp-imagemin');
// other
const browserSync   = require('browser-sync');
const argv          = require('minimist')(process.argv.slice(2));
const del           = require('del');
const server        = browserSync.create();
const flatten       = require('gulp-flatten');

const config = {
  srcDir: 'src/',
  serve: {
    develop: ['build/', 'build/html'],
    wordpress: ['dist/', 'dist/html']
  },
  destDir: {
    develop: './build/assets/',
    wordpress: './assets/',
    production: './assets/'
  },
  mainDir: {
    develop: './build/',
    wordpress: './assets/',
    production: './assets/'
  }
};
const paths = {
  html: {
    watch: config.srcDir + 'html/**/*.html',
    src: config.srcDir + 'html/*.html',
    dest: getConfig('mainDir') + 'html/'
  },
  scss: {
    watch: config.srcDir + 'assets/styles/**/*.scss',
    src: [config.srcDir + 'assets/styles/**/*.scss'],
    dest: getConfig('destDir') + 'styles/',
  },
  scssExternal: {
    src: [config.srcDir + 'assets/styles/external/*'],
    dest: getConfig('destDir') + 'styles/external',
  },
  jsExternal: {
    src: [config.srcDir + 'assets/js/external/**/*.js'],
    dest: getConfig('destDir') + 'js/external',
  },
  js: {
    watch: config.srcDir + 'assets/js/**/*.js',
    src: config.srcDir + 'assets/js/**/*.js',
    dest: getConfig('destDir') + 'js/'
  },
  images: {
    watch: config.srcDir + 'assets/images/**/*',
    src: config.srcDir + 'assets/images/**/*',
    dest: getConfig('destDir') + 'images/'
  },
  fonts: {
    watch: config.srcDir + 'assets/fonts/**/*',
    src: config.srcDir + 'assets/fonts/**/*',
    dest: getConfig('destDir') + 'fonts/'
  },
  init: function() {
    this.js.src = [ this.js.src, '!' + this.jsExternal.src ];
    delete this.init;
    return this;
  }
}.init();

function getMode() {
  const wordpress   = !!argv.wordpress || !!argv.wp;
  const production  = !!argv.production || !!argv.prod || !!argv.p;

  if (wordpress) {
    return 'wordpress';
  } else
  if (production) {
    return 'production';
  }

  return 'develop';
}
function getConfig(type) {
  return config[ type ][ getMode() ];
}
function getSrc(type) {
  return paths[ type ].src;
}
function getDest(type) {
  return paths[ type ].dest;
}
function getWatchDir(type) {
  return paths[ type ].watch;
}
function reload(cb) {
  server.reload();

  cb();
}

// -----------------
// ACTIONS
// -----------------

function removeDestDir(cb) {
  del.sync( getConfig('mainDir') );
  cb();
}

function includeHTML(cb) {
  if(getMode() == 'develop') {
    return src( getSrc('html') )
      .pipe(fileinclude({
        prefix: '@@',
        basepath: config.srcDir + 'html'
      }))
      .pipe(dest( getDest('html') ))
  }

  cb();
}

function scss(cb) {
  return src( getSrc('scss') )
    .pipe(sassGlob())
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(sourcemaps.write('./maps'))
    .pipe(dest( getDest('scss') ))
    .pipe(server.stream())

  cb();
}

function scss_external(cb) {
  return src( getSrc('scssExternal') )
    .pipe(dest( getDest('scssExternal') ))

  cb();
}

function js(cb) {
  return src( getSrc('js') )
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(concat('main.bundle.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('./maps'))
    .pipe(dest( getDest('js') ))

  cb();
}

function js_external(cb) {
  return src( getSrc('jsExternal') )
    .pipe(dest( getDest('jsExternal') ))

  cb();
}

function fonts(cb) {
  return src( getSrc('fonts') )
    .pipe(dest( getDest('fonts') ))

  cb();
}

function images(cb) {
  return src( getSrc('images') )
    .pipe( flatten() )
    .pipe(dest( getDest('images') ))

  cb();
}

function optimizeImages(cb) {
  return src( getSrc('images') )
  .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.jpegtran({progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
    })
  ]))
  .pipe( flatten() )
  .pipe(dest( getDest('images') ))

  cb();
}

function cleanImages(cb) {
  return del( getDest('images') )

  cb();
}

// -----------------
// SERIES & WATCHERS
// -----------------

function serve(cb) {
  server.init({
    server: {
      baseDir: getConfig('serve'),
      startPath: "index.html"
    }
  });

  cb();
}

function watchers(cb) {
  watch( getWatchDir('html'), { ignoreInitial: false }, series(includeHTML, reload));
  watch( getWatchDir('scss'), { ignoreInitial: false }, series(scss, scss_external));
  watch( getWatchDir('js'), { ignoreInitial: false }, series(js, js_external, reload));
  watch( getWatchDir('fonts'), { ignoreInitial: false }, series(fonts));
  watch( getWatchDir('images'), { ignoreInitial: false }, series(cleanImages, images, reload));

  cb();
}

function serveProxy(cb) {
  server.init({
    proxy: 'http://abk.test/'
  });

  cb();
}

exports.serve = series(removeDestDir, serve, watchers);
exports.build = series(removeDestDir, parallel(includeHTML, scss, scss_external, js, js_external, fonts, optimizeImages));
exports.wp = series(serveProxy);