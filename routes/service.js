var service = require('../controllers/service');

module.exports = function (app, tools) {
    //--------------------------- should be the last ----------------
	// Return a 404 for all undefined api, module or lib routes
	app.use(service.error404);

};