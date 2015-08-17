'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	runSequence = require('run-sequence'),
	plugins = gulpLoadPlugins(),
	path = require('path'),
    buildConfig = require('./config/build_config');

var assets = buildConfig.assets;

// Set NODE_ENV to 'development'
gulp.task('env:dev', function () {
    process.env.NODE_ENV = 'development';
});

// Set NODE_ENV to 'production'
gulp.task('env:prod', function () {
    process.env.NODE_ENV = 'production';
    
});

// Nodemon task
gulp.task('nodemon', function () {
	return plugins.nodemon({
		script: 'server.js',
		nodeArgs: ['--debug'],
		ext: 'js,html',
		watch: _.union(assets.server.views, assets.server.js)
	});
});

// Watch Files For Changes
gulp.task('watch', function() {
	// Start livereload
	plugins.livereload.listen();

	// Add watch rules
	gulp.watch(assets.server.views).on('change', plugins.livereload.changed);
	gulp.watch(assets.server.js, ['jshint']).on('change', plugins.livereload.changed);
	gulp.watch(assets.client.js, ['jshint']).on('change', plugins.livereload.changed);
	gulp.watch(assets.client.css, ['csslint']).on('change', plugins.livereload.changed);
	gulp.watch(assets.client.sass, ['sass', 'csslint']).on('change', plugins.livereload.changed);
	gulp.watch(assets.client.less, ['less', 'csslint']).on('change', plugins.livereload.changed);
});

// CSS linting task
gulp.task('csslint', function (done) {
	return gulp.src(assets.client.css)
		.pipe(plugins.csslint('.csslintrc'))
		.pipe(plugins.csslint.reporter())
		.pipe(plugins.csslint.reporter(function (file) {
			if (!file.csslint.errorCount) {
				done();
			}
		}));
});

// JS linting task
gulp.task('jshint', function () {
	return gulp.src(_.union(assets.server.js, assets.client.js))
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter('default'))
		.pipe(plugins.jshint.reporter('fail'));
});


// JS minifying task
gulp.task('uglify', function () {
	return gulp.src(assets.client.js)
		.pipe(plugins.ngAnnotate())
		.pipe(plugins.uglify({
			mangle: false
		}))
		.pipe(plugins.concat('application.min.js'))
		.pipe(gulp.dest('public/dist'));
});

// CSS minifying task
gulp.task('cssmin', function () {
	return gulp.src(assets.client.css)
		.pipe(plugins.cssmin())
		.pipe(plugins.concat('application.min.css'))
		.pipe(gulp.dest('public/dist'));
});

// Sass task
gulp.task('sass', function () {
	return gulp.src(assets.client.sass)
		.pipe(plugins.sass())
		.pipe(plugins.rename(function (file) {
			file.dirname = file.dirname.replace(path.sep + 'scss', path.sep + 'css');
		}))
		.pipe(gulp.dest('./modules/'));
});

// Less task
gulp.task('less', function () {
	return gulp.src(assets.client.less)
		.pipe(plugins.less())
		.pipe(plugins.rename(function (file) {
			file.dirname = file.dirname.replace(path.sep + 'less', path.sep + 'css');
		}))
		.pipe(gulp.dest('./modules/'));
});

// Lint CSS and JavaScript files.
gulp.task('lint', function(done) {
	runSequence('less', 'sass', ['csslint', 'jshint'], done);
});

// Lint project files and minify them into two production files.
gulp.task('build', function(done) {
	runSequence('lint', ['uglify', 'cssmin'], done);
});

// Run the project in development mode
gulp.task('default', function(done) {
	runSequence('env:dev', 'lint', ['nodemon', 'watch'], done);
});

// Run the project in debug mode
gulp.task('debug', function(done) {
	runSequence('env:dev', 'lint', ['nodemon', 'watch'], done);
});

// Run the project in production mode
gulp.task('prod', function(done) {
	runSequence('env:prod', 'build', 'lint', ['nodemon', 'watch'], done);
});
