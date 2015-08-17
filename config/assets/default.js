'use strict';

module.exports = {
	server: {
		js: [
            'gulpfile.js',
            'server.js', 
            'routes.js', 
            'controllers/**/*.js', 
            'models/**/*.js', 
            'util/*.js'
        ],
		views: ['views/**/*.html']
	},
    client: {
        css: ['vendor_assets/**/*.css', 'assets/**/*.css'],
        sass: ['assets/**/*.scss'],
        less: ['assets/**/*.less'],
        js: ['vendor_assets/**/*.js', 'assets/**/*.js'],
    },
};

module.exports.clientRuntime = module.exports.client;