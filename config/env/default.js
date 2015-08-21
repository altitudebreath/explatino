'use strict';

module.exports = {
    DEBUG: false,
    secure: true,
    port: process.env.PORT || 8080,
    sessionSecret: 'cCAuoac8exlkhc9KGRRHJHKN9905wajhggbnohfvmhlgeywswssssswe4jdxiuuius',
    sessionTable: 'sessions',
    db: {
        client: 'mysql',
        connection: {
            acquireTimeout: 10000, //ms before a timeout of the connection acquisition. 
            connectionLimit: 100,
            //socketPath: '/var/lib/mysql/mysql.sock'
        },
        dbDriver: 'mysql2',
        logQuery: true
    },
};
