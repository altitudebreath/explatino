'use strict';

var requireGlob = require('require-glob');

module.exports = {
    TBase: {
        create: function (db) {
            var t = this;
            return db.schema.hasTable(t.name).then(function (exists) {
           		if (!exists) {
                    console.log('Creating table: ' + t.name);
           			return db.schema.createTable(t.name, function (table) {
                        table.increments();
                        t.body(table);
                        table.timestamps();
           			});
           		}
           	}).catch(function(err){
                console.log(err);
            });
           	//.then(function () {
           	//	dbCleanup(self);
           	//	setInterval(dbCleanup, oneDay, self).unref();
           	//});
        }
    },

    createAll: function (db, cb) {
        requireGlob(['models/**/*.tbl.js'], 
            {
    //                keygen: function (file) { return file.shortPath; }
            },
            function (err, _modules) {
                if (_modules) {
                    for (var f of Object.keys(_modules)) {
                        console.log(_modules[f]);
                        _modules[f].create(db);
                    }
                }
            }
        );
    }
};