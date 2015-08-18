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
    compress = require('compression'),
    chalk = require('chalk');


function initLocalVariables (app) {
    
    var files = config.env.files;
    
	// Setting application local variables
	app.locals.secure = config.secure;
    //assign proper runtime files - raw or minified depending on environment
	app.locals.jsFiles = files.clientRuntime.js;
	app.locals.cssFiles = files.clientRuntime.css;
    
	app.locals.livereload = config.livereload;

    console.log(chalk.magenta(JSON.stringify(app.locals)));

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
        if (!err) return next('route');

        console.error(err.stack);

        if (req.xhr) {
            res.status(500).send({error: 'Something blew up!'});
        } else {
            res.status(500).send('<h>Server error</h><br />' +
            config.env.DEV ? err.stack : '');
        }
        //res.status(500).render('errors/500', {
       	//	error: 'Oops! Something went wrong...'
       	//});
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
    app.use(passport.initialize());
    app.use(passport.session());
    
    require('./util/auth')(passport);
    
    app.use(flash());
    app.use(messages());
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

app.use(cookieParser('nKYbykjmnfhvtFTHv'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(expressValidator());
app.use(serveStatic('./public'));

if (config.env.DEV) app.use(serveStatic('./assets'));

//---------------- TODO: deal with pages those needs and need not a cache
// Swig will cache templates for you, but you can disable
// that and use Express's caching instead, if you like:
app.set('view cache', false);
// To disable Swig's cache, do the following:
swig.setDefaults({ cache: false });
// NOTE: You should always cache templates in a production environment.
// Don't leave both of these to `false` in production!
//-------------
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

initLocalVariables(app);

initHelmetHeaders(app);

initSession(app);

//--------------------------
//should be the last after all middleware

require('./routes/main')(app);

initErrorRoutes(app);

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
