'use strict';

const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const config = require('../config');
const userModel = require('../models/user');

const init = () => {
    const parameters = {
        secretOrKey: config.secret,
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT')
    };

    passport.use('jwt', new Strategy(parameters, (payload, done) => {
        userModel.findById(payload.id, (error, user) => {
            if (error) return done(error, false);
            if (user) {
                return done(null, {
                    id: user.id,
                });
            }
            else {
                return done(new Error('User not found'), false);
            }
        });
    }));

    return {
        initialize: function () {
            return passport.initialize();
        },
        authenticate: function () {
            return passport.authenticate('jwt', config.session);
        }
    }
};

module.exports = init;