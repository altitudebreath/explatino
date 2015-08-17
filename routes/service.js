var service = require('../controllers/service');

module.exports = function (app, tools) {
	// Define error pages
	app.route('/server-error').get(service.error500);

    //--------------------------- should be the last ----------------
	// Return a 404 for all undefined api, module or lib routes
	app.use(service.error404);

};