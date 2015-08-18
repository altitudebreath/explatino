'use strict';

module.exports = {
    PROD: true,
    DEBUG: false,
	secure: true,
	port: process.env.PORT || 8080,
	db: {
		connection: {
            host: 'localhost',
            user: 'mysql',
            password: 'yourpass',
            database: 'test'
		}
	},
	log: {
		// Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
		format: 'combined',
		// Stream defaults to process.stdout
		// Uncomment to enable logging to a log on the file system
		options: {
			stream: 'access.log'
		}
	},
};
