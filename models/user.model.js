'use strict';
var config = require('../config');

function User(db_or_props, props) {
    var t = this;
    if (arguments.length > 1){
        t._db = db_or_props;
        t._props = props;
    } else {
        t._props = db_or_props;
    }
}

User.prototype = {
    _db: config.knex,
    tables: {
        user: 'user'
    }
};

User.prototype._select = function (props) {
        return this._db(this.tables.user).select().where(props);
};

User.prototype._create = function (props) {
        var t = this;
        return t._db(t.tables.user).insert(props);
};

User.prototype._update = function (criteria, toUpdate) {
        var t = this;
        return t._db(t.table).where(criteria).update(toUpdate);
};

User.prototype.remove = function () {
        var t = this;
        return t._db(t.table).where('id', t._props.id).del();
};
    

User.prototype.save = function () {
        var t = this;
        if (t._props.id){
            return t._create(t._props);
        }else{
            return t._update({id: t._props.id}, _.omit(t._props, 'id'));
        }
};

User.prototype.fetch = function () {
        var t = this;
        return t._select(t._props).then(function (user) {
            t._props = user;
            return user;
        });
};

module.exports = User;

