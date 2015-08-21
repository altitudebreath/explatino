'use strict';

var config = require('../config'),
    crypto = require('crypto');

var Bluebird = require('bluebird');
Bluebird.longStackTraces();

//Bluebird.onPossiblyUnhandledRejection(function(error){
//    throw error;
//});

function Model(props) {
    var t = this;
    t._modified = {};
    t._isNew = true;
    t._props = {};
    
    if (props) { //otherwise this is a singleton intended for fetch() etc
        for (var propName in t.schema) {
            if (typeof props[propName] !== 'undefined'){
                t._props[propName] = props[propName];
            } 
        }
    }    
}

Model.prototype = {
    _db: config.db,
    queries: {
    }, //IMPLEMENT ME
    updateOnExist: 'id',
    schema: {}, //IMPLEMENT ME
    tables: {} //IMPLEMENT ME
};

Model.prototype.db = function (db) {
    this._db = db;
    return this;
};

Model.prototype.get = function (name) {
    return this._props[name];
};

Model.prototype.set = function (name, value) {
    var t = this;
    var originalValue = t._props[name];

    if (value !== originalValue) {
        t._props[name] = value;
        t._modified[name] = true;
    }
};

Model.prototype.sqlEx = function (props, separator) {
    return _.map(props, function(value, key) {
      return key + ' = :' + key;
    }).join(' ' + separator + ' ');
};

//by some reason Bluebird don't want to expand traces with longStackTraces...
Model.prototype._exec = function (reject, query, props, cb) {
    var t = this;
    try{
        return t._db.execute(query, props, cb);
    }catch(e){
        console.log(e.stack);
        console.trace(e.message);
        reject(e);
    }
};

Model.prototype._select = function (props, query) {
    var t = this;
    query = query || t.queries._select;
    return new Bluebird(function(resolve, reject) {
        t._exec(reject, query(t, props), props, function (err, rows) {
            if(err) return reject(err);
            return resolve(rows);
        });
    });
};

Model.prototype._create = function (props, query) {
    var t = this;
    query = query || t.queries._create;
    
    return new Bluebird(function (resolve, reject) {
            t._exec(reject, query(t, props), props, function (err, result) {
                    if(err) return reject(err);
                    t._modified = {};
                    t._isNew = false;
                    return resolve(result.insertId); //https://github.com/felixge/node-mysql#getting-the-id-of-an-inserted-row
                }
            );
    });
};

Model.prototype._update = function (props, query) {
    var t = this;
    query = query || t.queries._update;
    return new Bluebird(function (resolve, reject) {
        t._exec(reject, query(t, props), props, function (err) {
                if (err) return reject(err);
                t._modified = {};
                t._isNew = false;
                return resolve(true);
            }
        );
    });
};

Model.prototype.remove = function (query) {
    var t = this;
    query = query || t.queries._remove;
    return new Bluebird(function (resolve, reject) {
        t._exec(reject, query(t), {}, function (err) {
                if(err) return reject(err);
                return resolve(true);
            }
        );
    });
};


Model.prototype.save = function () {
    var t = this;
    
    t._pre_save();
    
    console.log('SAVE ---------');
    
    if (typeof t._props[t.updateOnExist] === CONST.UNDEF) {
        return t._create(t._props);
    } else {
        return t._update(t._props);
    }
};

Model.prototype._fetch = function (criteria, findOne, query) {
    var t = this;
    query = query || t.queries._fetch;
    t._props = {};
    return t._select(criteria, query).then(function (rows) {
        if(findOne && rows.length > 1) throw Error('Multiple results');
        
        if (rows.length >= 1) {
            t._isNew = false;
            if (findOne) {
                t._props = rows[0];
                return t;
            }else{
                var models = [];
                for (var r of rows) {
                    models.push(new Model(r));
                }
                return models;
            }
        }else{
            return findOne ? null : [];
        }
        
    });

};

Model.prototype.findById = function (id) {
    return this._fetch({id: id}, true, this.queries.findById);
};


Model.prototype.findBy = function (criteria) {
    return this._fetch(criteria, true, this.queries.findBy);
};


Model.prototype.findAllBy = function (criteria) {
    var t = this;
    return t._fetch(criteria, false, t.queries.findAllBy);
};

Model.prototype.isModified = function (prop) {
    var t = this;
    return t._isNew || t._modified[prop];
};

Model.prototype._pre_save = function () {/*IMPLEMENT ME*/};

module.exports = Model;
