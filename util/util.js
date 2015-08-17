'use strict';
require('./globals');
var path = require('path');

module.exports = {
    path: function () {
        return path.join.apply(path, _.union([process.cwd()], arguments));
    }
};