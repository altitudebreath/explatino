'use strict';
var config = require('../config'),
    crypto = require('crypto');


function User(props) {
    var t = this;
    t._modified = {};
    t._isNew = true;
    t._props = {};
    
    if (props) { //otherwise this is a singleton intended for fetch() etc
        for (var propName in t.schema) {
            t._props[propName] = props[propName] || null;
        }
    }    
}

User.prototype = {
    _db: config.knex,
    schema: {
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
    tables: {
        user: 'user'
    }
};

User.prototype.db = function (db) {
    this._db = db;
    return this;
};

User.prototype.get = function (name) {
    return this._props[name];
};

User.prototype.set = function (name, value) {
    var t = this;
    var originalValue = t._props[name];

    if (value !== originalValue) {
        t._props[name] = value;
        t._modified[name] = true;
    }
};

User.prototype._select = function (props) {
    return this._db(this.tables.user).select().where(props);
};

User.prototype._create = function (props) {
    console.log('_create');
    var t = this;
    return t._db(t.tables.user).insert(props);
};

User.prototype._update = function (criteria, toUpdate) {
    var t = this;
    return t._db(t.tables.user).where(criteria).update(toUpdate);
};

User.prototype.remove = function () {
    var t = this;
    return t._db(t.tables.user).where('id', t._props.id).del();
};


User.prototype.save = function () {
    var t = this, promise;
    
    t._pre_save();
    console.log('SAVE ---------');
    if (! t._props.id) {
        promise = t._create(t._props);
    } else {
        promise =  t._update({id: t._props.id}, _.omit(t._props, 'id'));
    }
    promise.then(function (result) {
        t._modified = {};
        t._isNew = false;
        return result;
    });
    
    return promise;
};

User.prototype._fetch = function (criteria, findOne) {
    var t = this;
    t._props = {};
    return t._select(criteria).then(function (rows) {
        if(findOne && rows.length > 1) throw Error('Multiple results');
        
        if (rows.length >= 1) {
            t._isNew = false;
            if (findOne) {
                t._props = rows[0];
                return t;
            }else{
                var models = [];
                for (var r of rows) {
                    models.push(new User(r));
                }
                return models;
            }
        }else{
            return findOne ? null : [];
        }
        
    });

};

User.prototype.findById = function (id) {
    return this._fetch({id: id}, true);
};


User.prototype.findBy = function (criteria) {
    return this._fetch(criteria, true);
};


User.prototype.findAllBy = function (criteria) {
    var t = this;
    return t._fetch(criteria, false);
};

User.prototype.isModified = function (prop) {
    var t = this;
    return t._isNew || t._modified[prop];
};

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

