'use strict';

var crypto = require('crypto'),
    passport = require('passport'),
    User = require('../models/user.model');


exports.registerPage = function(req, res) {
    res.render('login/register', {username: req.flash('username')});
};


exports.registerPost = function(req, res) {
    var pwdconfirm = req.body.pwdconfirm;
    var pwd = req.body.password;
    var username = req.body.username;
    
    req.flash('username', username);
    
    if(pwdconfirm !== pwd) {
        req.flash('error', 'Your passwords did not match.');
        res.redirect('/register');
        return;
    }

    if(pwd.length < 6) {
        req.flash('error', 'Your password should be >= 6 symbols');
        res.redirect('/register');
        return;
    }

    req.checkBody('username', 'Please enter a valid email.').notEmpty().isEmail();
    var errors = req.validationErrors();
    if (errors) {
        var msg = errors[0].msg;
        console.log(errors);
        req.flash('error', msg);
        res.redirect('/register');
        return;
    }
    
    new User({email: username, username: username, password: pwd, provider: 'local'}).save()
        .then(function(model) {
            passport.authenticate('local')(req, res, function () {
                res.redirect('/home');
            });
        }, function(err) {
            console.log(err);
            req.flash('error', 'Unable to create account.');
            res.redirect('/register');
        });
};


exports.loginPage = function(req, res) {
    res.render('login/login', {username: req.flash('username')});
};


exports.checkLogin = function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err || !user) {
            console.log(err);
            req.flash('username', req.body.username);
            req.flash('error', err);
            return res.redirect('/login');
        }
        req.login(user, function(err) {
            console.log('======login  :auth======> ' + req.isAuthenticated());
            if (err) {
                console.log(err);
                req.flash('error', err);
                return res.redirect('/login');
            }
            req.flash('success', 'Welcome!');
            return res.redirect('/home');
        });
    })(req, res, next);
};


exports.logout = function(req, res) {
    req.logout();
    console.log('======logout:auth======> ' + req.isAuthenticated());
    req.flash('info', 'You are now logged out.');
    res.redirect('/login');
};
