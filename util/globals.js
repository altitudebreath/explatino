'use strict';

global._ = require('lodash');

//global.Bluebird = require('bluebird');
//Bluebird.longStackTraces();
//Bluebird.onPossiblyUnhandledRejection(function(error){
//    throw error;
//});

global.CONST = {
    UNDEF: 'undefined'
};

global.makeClass = function (Ancestor, ext) {
    var Klass = ext.constructor;
    Klass.prototype = Object.create(Ancestor.prototype);
    _.merge(Klass.prototype, ext);
    return Klass;
};