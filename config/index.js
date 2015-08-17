'use strict';

/**
 * Module dependencies.
 */
require('../util/globals');

var chalk = require('chalk'),
    glob = require('glob'),
    fs = require('fs'),
    path = require('path'),
    knex = require('knex');
    //bookshelf = require('bookshelf');

/**
 * Validate Secure=true parameter can actually be turned on
 * because it requires certs and key files to be available
 */
var validateSecureMode = function(config) {

    if (config.secure !== true)
        return true;

    var privateKey = fs.existsSync('./config/sslcerts/key.pem');
    var certificate = fs.existsSync('./config/sslcerts/cert.pem');

    if (!privateKey || !certificate) {
        console.log(chalk.red('+ Error: Certificate file or key file is missing, falling back to non-SSL mode'));
        console.log(chalk.red('  To create them, simply run the following from your shell: sh ./scripts/generate-ssl-certs.sh'));
        console.log();
        config.secure = false;
    }
};


/**
 * Validate NODE_ENV existance
 */
var validateEnvironmentVariable = function() {
    var environmentFiles = glob.sync('./config/env/' + process.env.NODE_ENV + '.js');
    console.log();
    if (!environmentFiles.length) {
        if (process.env.NODE_ENV) {
            console.error(chalk.red('+ Error: No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead'));
        } else {
            console.error(chalk.red('+ Error: NODE_ENV is not defined! Using default development environment'));
        }
        process.env.NODE_ENV = 'development';
    }
    // Reset console color
    console.log(chalk.white(''));
};


var getGlobbedPaths = function(globPatterns, cutouts) {
    // URL paths regex
    var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

    // The output array
    var output = [];

    // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
    if (_.isArray(globPatterns)) {
        globPatterns.forEach(function(globPattern) {
            output = _.union(output, getGlobbedPaths(globPattern, cutouts));
        });
    } else if (_.isString(globPatterns)) {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        } else {
            var fileNames = glob.sync(globPatterns);
            if (cutouts) {
                fileNames = fileNames.map(function(file) {
                    if (_.isArray(cutouts)) {
                        for (var i in cutouts) {
                            file = file.replace(cutouts[i], '');
                        }
                    } else {
                        file = file.replace(cutouts, '');
                    }
                    return file;
                });
            }
            output = _.union(output, fileNames);
        }
    }

    return output;
};

var initGlobalConfigFiles = function(config, assets) {
    // Appending files
    config.files = {
        server: {},
        client: {},
        clientRuntime: {}
    };

    // Setting Globbed js files
    config.files.client.js = getGlobbedPaths(assets.client.js, ['client/', 'public/']);

    // Setting Globbed js files
    config.files.clientRuntime.js = getGlobbedPaths(assets.clientRuntime.js, ['client/', 'public/']);

    // Setting Globbed css files
    config.files.client.css = getGlobbedPaths(assets.client.css, ['client/', 'public/']);

    // Setting Globbed css files
    config.files.clientRuntime.css = getGlobbedPaths(assets.clientRuntime.css, ['client/', 'public/']);

};

var initDB = function (config) {
    var dbConfig = config.env.db;
    var db = knex(dbConfig);
    
    config.knex = db;
    
    db.close = function (cb) {
        db.destroy(function (err) {
            console.info(chalk.yellow('Disconnected from MongoDB.'));
            if (cb) cb(err);
        });
    };

    if (dbConfig.logQuery) {
        db.on('query', function (data) {
            console.log(chalk.yellow('SQL: ' + data.sql + ' Data: ' + data.bindings));
        });
    }
    
    //config.orm = bookshelf(db);
};

var getAssets = function () {
	// Get the default assets
	var assets = require(path.join(process.cwd(), 'config/assets/default'));

	// Get the current assets
	var environmentAssets = require(path.join(process.cwd(), 'config/assets/', process.env.NODE_ENV)) || {};

	// Merge assets
	_.merge(assets, environmentAssets);
    
    return assets;
};


var getEnv = function () {
    // Get the default config
    var env = require(path.join(process.cwd(), 'config/env/default'));

    // Get the current config
    var environmentConfig = require(
            path.join(process.cwd(), 'config/env/', process.env.NODE_ENV)) || {};

    // Merge config files
    _.merge(env, environmentConfig);

    var _path = path.join(process.cwd(), 'config/env/_local.js');
    
    //Merge local config
    try {
        _.merge(env, require(_path));
    }catch(e){
        console.log(chalk.magenta('\n_local.js is NOT present\n'));
    }
    
    return env;
};

/**
 * Initialize global configuration
 */
var initGlobalConfig = function() {
    // Validate NDOE_ENV existance
    validateEnvironmentVariable();

    var assets = getAssets();
    
    var env = getEnv();
    
    // Initialize global globbed files
    initGlobalConfigFiles(env, assets);

    // Validate Secure SSL mode can be used
    validateSecureMode(env);

    var config = {
        env: env,
        assets: assets
    };
    
    initDB(config);
    
    return config;
};

/**
 * Set configuration object
 */
module.exports = initGlobalConfig();
