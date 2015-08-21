'use strict';

process.env.NODE_ENV = 'development';

var glob = require('glob'),
    config = require('../config'),
    fs = require('fs');

//console.log(config.env.db.connection);

glob(__dirname + '/../tables/**/*.sql', 
    {
//                keygen: function (file) { return file.shortPath; }
    },
    function (err, files) {
        if (files) {
            var l = files.length;
            
            for (var i in files) {
                (function(f) {
                    var data = fs.readFileSync(f).toString('utf8');
                    config.db.query(data, {}, function (err) {
                        console.log('\n\n\n======================= FILE: ' + f + '  ==============================');
                        console.log(data);
                        console.log('---------------------------\n'
                            + (err ? 'Errors: ' + err : 'Done.'));
                        if (--l === 0){
                            config.db.end(function (err) {
                                console.log('\n\n\n***********************************\n' +
                                    'Finished closing connections, errors=' + err + '\n\n');
                                // Now we can exit to let the reload mechanism do its job
                                process.exit(0);
                            });
                        }
                    });
                })(files[i]);
            }
        } else {
            console.log('No files!!!');
        }
    }
);
