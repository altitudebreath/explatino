'use strict';

var crypto = require('crypto'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('../models/user.m.js');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.get('id'));
    });


    passport.deserializeUser(function(user_id, done) {
        new User().findById(user_id).then(function(user) {
            if (user) {
                return done(null, user);
            }else{
                return(new Error('user not found'));
            }
        }, function(error) {
            return done(error);
        });
    });


    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },function(email, password, done) {
        new User().findBy({email: email}).then(function(user) {
            if(user && user.authenticate(password)) {
                return done(null, user);
            }
            return done(null, false, { 'message': 'Invalid password'});
        }, function(error) {
            return done(null, false, { 'message': 'Unknown user'});
        });
    }));
};
