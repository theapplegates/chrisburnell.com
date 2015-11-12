/*!
 * Chris Burnell gulp Configuration
 */


// Define gulp objects
var gulp         = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    concat       = require('gulp-concat'),
    csslint      = require('gulp-csslint'),
    cssnano      = require('gulp-cssnano'),
    plumber      = require('gulp-plumber'),
    notify       = require('gulp-notify'),
    rename       = require('gulp-rename'),
    sass         = require('gulp-sass'),
    uglify       = require('gulp-uglify'),
    watch        = require('gulp-watch');

// Define external objects
var csscomb = require('csscomb');
var comb = new csscomb();
var sassdoc = require('sassdoc');

// Define paths
var paths = {
    root: './',
    src: {
        css: 'src/css/',
        js: 'src/js/'
    },
    dist: {
        css: 'css/',
        js: 'js/'
    },
    includes: '_includes/',
    docs: 'sassdoc/'
};

// -----------------------------------------------------------------------------

// Compile main SCSS file
gulp.task('css-main', function() {
    return gulp.src([paths.src.css + '*.scss'])
        .pipe(plumber())
        .pipe(sass({
            errLogToConsole: true,
            style: 'expanded'
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', '> 1%']
        }))
        .pipe(csslint({
            'box-model': false,
            'box-sizing': false,
            'compatible-vendor-prefixes': false,
            'display-property-grouping': false,
            'fallback-colors': false,
            'floats': false,
            'font-sizes': false,
            'gradients': false,
            'important': false,
            'known-properties': false,
            'outline-none': false,
            'qualified-headings': false,
            'regex-selectors': false,
            'unique-headings': false,
            'universal-selector': false,
            'unqualified-attributes': false
        }))
        .pipe(csslint.reporter())
        .pipe(gulp.dest(paths.dist.css))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(cssnano())
        .pipe(gulp.dest(paths.dist.css))
        .pipe(notify({
            title: 'gulp',
            message: 'CSS compiled.',
            onLast: true
        }));
});

// Compile critical SCSS file
gulp.task('css-critical', function() {
    return gulp.src([paths.dist.css + 'critical.min.css'])
        .pipe(plumber())
        .pipe(rename({
            basename: "critical-css",
            extname: ".html"
        }))
        .pipe(gulp.dest(paths.includes + 'generated/'))
        .pipe(notify({
            title: 'gulp',
            message: 'Critical CSS compiled.',
            onLast: true
        }));
});

// Generate Sass documentation
gulp.task('css-sassdoc', function() {
    return gulp.src([paths.src.css + '**/*.scss'])
        .pipe(plumber())
        .pipe(sassdoc({
            dest: paths.docs
        }))
        .pipe(notify({
            title: 'gulp',
            message: 'SassDoc compiled.',
            onLast: true
        }));
});

// Minify JS
gulp.task('js-main', function() {
    return gulp.src(['!' + paths.src.js + 'loadcss.js',
                     '!' + paths.src.js + 'serviceworker.js',
                     paths.src.js + '*.js'])
        .pipe(plumber())
        .pipe(concat('main.js'))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(uglify({
            mangle: false,
            preserveComments: 'some'
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(notify({
            title: 'gulp',
            message: 'JS compiled.',
            onLast: true
        }));
});

// Generate inline LoadCSS include
gulp.task('js-loadcss', function() {
    return gulp.src([paths.src.js + 'loadcss.js'])
        .pipe(plumber())
        .pipe(uglify({
            mangle: false,
            preserveComments: 'some'
        }))
        .pipe(rename({
            basename: "loadcss",
            extname: ".html"
        }))
        .pipe(gulp.dest(paths.includes + 'generated/'))
        .pipe(notify({
            title: 'gulp',
            message: 'LoadCSS JS compiled.',
            onLast: true
        }));
});

// Place the Service Worker at the root
gulp.task('js-serviceworker', function() {
    return gulp.src([paths.src.js + 'serviceworker.js'])
        .pipe(plumber())
        .pipe(uglify({
            mangle: false,
            preserveComments: 'some'
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.root))
        .pipe(notify({
            title: 'gulp',
            message: 'Service Worker JS compiled.',
            onLast: true
        }));
});

// -----------------------------------------------------------------------------

// Default task
gulp.task('default', function() {
    gulp.start('css');
    gulp.start('js');
});

// CSS task
gulp.task('css', function() {
    gulp.start('css-main');
    gulp.start('css-critical');
    gulp.start('css-sassdoc');
});

// JS task
gulp.task('js', function() {
    gulp.start('js-main');
    gulp.start('js-loadcss');
    gulp.start('js-serviceworker');
});

// -----------------------------------------------------------------------------

// Watch files and perform the appropriate tasks
gulp.task('watch', ['css', 'js'], function() {
    watch(paths.src.css + '**/*.scss', function() {
        gulp.start('css');
    });
    watch([paths.src.js + '**/*.js'], function() {
        gulp.start('js');
    });
});
