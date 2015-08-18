'use strict';

module.exports = {
    DEV: true,
    DEBUG: true,
	secure: false,
    port: process.env.PORT || 7000,
    db: {
		connection: {
			host: 'localhost',
			user: 'mysql',
			password: 'yourpass',
			database: 'test'
		}
	},
    livereload: true,
	log: {
		// Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
		format: 'dev',
		// Stream defaults to process.stdout
		// Uncomment to enable logging to a log on the file system
		options: {
			//stream: 'access.log'
		}
	},
};
