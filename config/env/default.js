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
            connectionLimit: 100,
            //socketPath: '/var/lib/mysql/mysql.sock'
        },
        pool: {
            min: 0,
            max: 7
        },
        dbDriver: 'mysql2',
        migrations: {
            tableName: 'knex_migrations'
        },
        logQuery: true
    },
};
