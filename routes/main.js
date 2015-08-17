
var _app = require('./app'),
    api = require('./api'),
    service = require('./service');
    
var tools = require('./tools');

module.exports = function (app) {

    _app(app, tools);
    api(app, tools);
    //should be the last
    service(app, tools);
    
};
