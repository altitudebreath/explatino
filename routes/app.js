var indexController = require('./../controllers/index'),
    loginController = require('./../controllers/login');

module.exports = function (app, tools) {

    // Home
    app.get('/', indexController.home);
    app.get('/home', tools.auth, indexController.userHome);


    // Auth
    app.get('/register', loginController.registerPage);
    app.post('/register', loginController.registerPost);
    app.get('/login', loginController.loginPage);
    app.post('/login', loginController.checkLogin);
    app.get('/logout', loginController.logout);
};