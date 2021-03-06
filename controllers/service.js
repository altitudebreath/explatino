'use strict';

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.error404 = function(req, res, next) {

	res.status(404).format({
			'text/html': function(){
				res.render('errors/404', {
					url: req.originalUrl
				});
			},
			'application/json': function(){
				res.json({ error: 'Path not found' });
			},
			'default': function(){
				res.send('Path not found');
			}
		});
    next();
};
