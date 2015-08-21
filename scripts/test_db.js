require('../lib/globals');

process.env.NODE_ENV = 'development';

var User = require('../models/user.m.js'),
	config = require('../config');

var db = config.db;

var u = new User({first_name: 'Henry'}).db(db);
u.save();
debugger;