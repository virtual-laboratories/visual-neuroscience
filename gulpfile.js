'use strict';
var path = require('path');
var browserSync = require('browser-sync').create();
var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var eslint = require('gulp-eslint');
var excludeGitignore = require('gulp-exclude-gitignore');
var imagemin = require('gulp-imagemin');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var uncss = require('gulp-uncss');

gulp.task('scripts', function() {
	gulp.src(['js/vendor/jquery-2.2.0.min.js',
			'js/vendor/*.js',
			'js/*.js'
		])
		.pipe(sourcemaps.init())
		.pipe(concat('all.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist/js'));
});
// Only run when ready to release
gulp.task('scripts-dist', function() {
	gulp.src(['js/vendor/jquery-2.2.0.min.js',
			'js/vendor/*.js',
			'js/*.js'
		])
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
});

gulp.task('copy-D3files', function() {
	gulp.src('js/D3/*.js')
		.pipe(gulp.dest('./dist/js/D3'));
});

gulp.task('copy-html', function() {
	gulp.src('*.html')
		.pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
	gulp.src('img/**/*')
    .pipe(imagemin({ progressive: true }))
		.pipe(gulp.dest('dist/img'));
});

gulp.task('styles', function() {
	gulp.src(['sass/vendor/reset.scss',
			'sass/vendor/bootstrap.min.scss',
			'sass/vendor/style.scss',
			'sass/vendor/*.scss',
			'sass/custom.scss',
			'sass/*.scss'
		])
    .pipe(sourcemaps.init()) // Initialize sourcemap plugin
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(concat('all.css'))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
    .pipe(sourcemaps.write()) // Writing sourcemaps
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream());
});

gulp.task('styles-dist', function() {
	gulp.src(['sass/vendor/reset.scss',
			'sass/vendor/bootstrap.min.scss',
			'sass/vendor/style.scss',
			'sass/vendor/*.scss',
			'sass/custom.scss',
			'sass/*.scss'
		])
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(concat('all.css'))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(cssnano())
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream());
});

gulp.task('lint', function () {
	return gulp.src(['js/**/*.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});

gulp.task('dist', ['copy-html', 'copy-images', 'copy-D3files', 'styles-dist','lint','scripts-dist']);
gulp.task('default', ['copy-html', 'copy-images', 'copy-D3files', 'styles', 'lint', 'scripts'], function() {
	gulp.watch('sass/**/*.scss', ['styles']);
	gulp.watch('js/**/*.js', ['lint','scripts']);
	gulp.watch('js/D3/*.js', ['copy-D3files']);
	gulp.watch('img/**/*', ['copy-images']);
	gulp.watch('*.html', ['copy-html']);
	gulp.watch('./dist/*.html').on('change', browserSync.reload);
	gulp.watch('./dist/js/**/*.js').on('change', browserSync.reload);

	browserSync.init({
		server: './dist'
	});
});
