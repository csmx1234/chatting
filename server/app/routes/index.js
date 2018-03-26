'use strict';

const app = require('express')();
const jwt = require('jwt-simple');
const moment = require('moment');
const bcrypt = require('bcrypt');

const auth = require('../auth')();
const config = require('../config');
const userModel = require('../models/user');
const user_url = `${config.api_url}/user`;
const login_url = `${config.api_url}/login`;
const logout_url = `${config.api_url}/logout`;

app.use(auth.initialize());

// function to generate a token based on user id
const genToken = (id) => {
    let expires = moment().utc().add({ minutes: 30 }).unix();
    let token = jwt.encode({
        id: id,
        exp: expires
    }, config.secret);

    return {
        token: 'JWT ' + token,
        expires: moment.unix(expires).format(),
        id: id
    }
};

app.route(config.api_url).get((req, res) => res.send('Welcome to server api'));

app.route(user_url)
    // get user data
    .get(auth.authenticate(), (req, res) => {
        userModel.findById(req.user.id).lean().exec((err, user) => {
            res.status(201).json(user);
        });
    })
    // register user
    .post((req, res) => {
        let username = req.body.username;
        let password = req.body.password;

        if (username && password) {
            new userModel(req.body).save(err => {
                if (err) return res.status(409).json({'message': 'Username already exists'});
                res.status(201).send('Registered');
            });
        } else {
            res.status(400).json({'message': 'Invalid username or password'});
        }
    })
    // update user
    .put(auth.authenticate(), (req, res) => {
        let password = req.body.password;

        // TODO reengineer the code
        // since mongoose doens't have pre hook for findByIdAndUpdate, so I'm going to hash my password here
        // change password
        bcrypt.genSalt(10, (error, salt) => {
            if (error) return next(error);
            bcrypt.hash(password, salt, (error, hash) => {
                if (error) return next(error);
                userModel.findByIdAndUpdate(req.user.id, { password: hash }, (err, user) => {
                    if (err) return res.status(503).send('Failed to change password');
                    res.status(201).send('Successfully changed password');
                });
            });
        });
    })
    // delete user
    .delete();

app.route(login_url)
    // login user
    .post((req, res) => {
        let username = req.body.username;
        let password = req.body.password;

        userModel.findOne({ username: username }, (err, user) => {
            if (err) throw err;

            if (!user) return res.status(401).send('User not found');

            user.comparePassword(password, (err, matches) => {
                if (!err && matches) {
                    res.status(201).json(genToken(user.id));
                } else {
                    res.status(401).send('Authentication failed, wrong password');
                }
            });
        })
    });

app.route(logout_url)
    // TODO delete token from browser
    // logout user
    .post(auth.authenticate(), (req, res) => {
        req.logout();
        res.send("logged out");
    });

module.exports = app;