'use strict';
var TBase = require('./table').TBase;

module.exports = _.extend({}, TBase, {
    name: 'user',
    
    body: function (tbl) {
        tbl.string('first_name', 100).defaultTo('');
        tbl.string('last_name', 100).defaultTo('');
        tbl.string('email', 100).unique();
        tbl.string('username', 100).unique().notNullable();
        tbl.string('password', 100);
        tbl.string('salt', 256);
        tbl.string('profileImageURL', 512).defaultTo('');
        tbl.string('provider', 100).notNullable();
        tbl.json('providerData');
        tbl.enu('roles', ['user', 'admin']).defaultTo('user');
        tbl.string('resetPasswordToken', 100);
        tbl.datetime('resetPasswordExpires');
        tbl.boolean('active');
    },
    
});