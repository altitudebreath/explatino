'use strict';

process.env.NODE_ENV = 'development';

var table = require('../models/table'),
	config = require('../config');

table.createAll(config.knex, function(){
    //process.exit(0);
});

