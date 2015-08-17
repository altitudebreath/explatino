'use strict';

// TODO: Find a better way to load different configs in different env
var config = require('./config');


var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
   	KnexSessionStore = require('connect-session-knex')(session),
    serveStatic = require('serve-static'),
    expressValidator = require('express-validator'),
    flash = require('connect-flash'),
    swig = require('swig'),
    passport = require('passport'),
    crypto = require('crypto'),
    messages = require('./util/messages'),
    helmet = require('helmet'),
    favicon = require('serve-favicon'),
    compress = require('compression');


function initLocalVariables (app) {
	// Setting application local variables
	app.locals.secure = config.secure;
    //assign proper runtime files - raw or minified depending on environment
	app.locals.jsFiles = config.files.clientRuntime.js;
	app.locals.cssFiles = config.files.clientRuntime.css;
    
	app.locals.livereload = config.livereload;

	// Passing the request url to environment locals
	app.use(function (req, res, next) {
		res.locals.host = req.protocol + '://' + req.hostname;
		res.locals.url = req.protocol + '://' + req.headers.host + req.originalUrl;
		next();
	});
}

var initErrorRoutes = function (app) {
	app.use(function (err, req, res, next) {
		// If the error object doesn't exists
		if (!err) return next();

		// Log it
		console.error(err.stack);

		// Redirect to error page
		res.redirect('/server-error');
	});
};

function initSession (app) {
	// Express MongoDB session storage
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret,
		store: new KnexSessionStore({
			tablename: config.sessionTable,
			knex: config.knex
		})
	}));
}

function initHelmetHeaders(app) {
	// Use helmet to secure Express headers
	app.use(helmet.xframe());
	app.use(helmet.xssFilter());
	app.use(helmet.nosniff());
	app.use(helmet.ienoopen());
	app.disable('x-powered-by');
}

var app = express();

app.knex = config.knex;

app.use(cookieParser('nKYbykjmnfhvtFTHv'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(expressValidator());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(serveStatic('./public'));
//app.use(express.favicon(__dirname + '/public/images/shortcut-icon.png'));
app.use(messages());

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// Initialize favicon middleware
app.use(favicon('./public/img/favicon.ico'));

app.use(compress({
	filter: function (req, res) {
		return (/json|text|javascript|css|font|svg/).test(res.getHeader('Content-Type'));
	},
	level: 9
}));

initHelmetHeaders(app);

initSession(app);

initErrorRoutes(app);

require('./util/auth')(passport);

//--------------------------
//should be the last after all middleware
require('./routes/main')(app);

app.listen(config.env.port);

console.log('Server is up at: http://localhost:' + config.env.port);

//PM2 Graceful Reload handling
process.on('message', function (msg) {
    if (msg === 'shutdown') {
        console.log('Closing all connections...');
        // You will have 4000ms to close all connections before
        // the reload mechanism will try to do its job
        config.knex.close(function () {
            console.log('Finished closing connections');
            // Now we can exit to let the reload mechanism do its job
            process.exit(0);
        });

    }
});
