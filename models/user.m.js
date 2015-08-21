'use strict';
var Model = require('./model'),
    crypto = require('crypto');


var User = makeClass(Model, { 
        constructor: function (props) {
            Model.call(this, props);
        },
        tables: {
            user: 'user'
        },
        schema: {
            id: {},
            first_name: {},
            last_name: {},
            email: {},
            username: {},
            password: {},
            salt:{},
            provider: {},
            provider_data: {},
            roles: {},
            reset_password_token: {},
            reset_password_expires: {},
            active: {}
        },
        updateOnExist: 'id',
        queries: {
            _fetch: function (t, props) {
                return 'SELECT * FROM ' +
                    t.tables.user + ' WHERE ' + t.sqlEx(props, 'AND');
            },
            _create: function (t, props) {
                return ['INSERT INTO', t.tables.user,
                    'SET', t.sqlEx(props, ',')
                ].join(' ');
            },
            _update: function (t, props) {
                return ['UPDATE', t.tables.user,
                    'SET', t.sqlEx(_.omit(props, 'id'), ','),
                    'WHERE id=:id' 
                ].join(' ');
            },
            remove: function (t, props) {
                return ['DELETE FROM', t.tables.user, 'WHERE id=:id'].join(' ');
            }
        }
    }
);

User.prototype._pre_save = function () {
    var t = this,
        password = t.get('password');
    
    if (password && t.isModified('password') && password.length > 6) {
        t.set('salt', crypto.randomBytes(16).toString('base64'));
        t.set('password', t.hashPassword(password));
    }
};
/**
 * Create instance method for hashing a password
 */
User.prototype.hashPassword = function (password) {
    var t = this;
    var salt = t.get('salt');
    if (salt && password) {
        return crypto.pbkdf2Sync(password, new Buffer(salt, 'base64'), 10000, 64).toString('base64');
    } else {
        return password;
    }
};
    
/**
 * Create instance method for authenticating user
 */
User.prototype.authenticate = function (password) {
    return this.get('password') === this.hashPassword(password);
};


module.exports = User;

