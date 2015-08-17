require('../lib/globals');

process.env.NODE_ENV = 'development';

var User = require('../models/user.model'),
	config = require('../config');

var db = config.knex;

var u = new User(db, {first_name: 'Henry'});
u.save();
debugger;