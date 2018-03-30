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
    let expires = moment().utc().add(config.token_exp).unix();
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

// function to change database
const updateValue = (req, res, obj) => {
    userModel.findByIdAndUpdate(req.user.id, obj, { upsert: true }, (err, user) => {
        if (err) res.status(503).json({ 'message': `Failed to change ${obj}` });
    });
}

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
            req.body.reg_date = Date.now();
            new userModel(req.body).save(err => {
                if (err) return res.status(409).json({ 'message': 'Username already exists' });
                res.status(201).json({ 'message': "Successfully registered, please login now!" });
            });
        } else {
            res.status(400).json({ 'message': 'Invalid username or password' });
        }
    })
    // update user
    .put(auth.authenticate(), (req, res) => {
        let password = req.body.password;
        let email = req.body.email;
        let reg_date = req.body.reg_date;
        let is_verified = req.body.is_verified;
        let questions_answered = req.body.questions_answered;
        let questions_picked = req.body.questions_picked;
        let friend_request = req.body.friend_request;
        let req_user_id = req.body.req_user_id;
        let req_msg = req.body.req_msg;
        let req_date = req.body.req_date;
        let is_online = req.body.is_online;
        let chat_id = req.body.chat_id;
        let chat_room = req.body.chat_room;
        let friend_list = req.body.friend_list;

        // change online status
        if (is_online && chat_id) {

            console.log('got some messages!')
            // TODO check if already online previously (login on other devices)
            updateValue(req, res, { 'is_online': is_online });
            updateValue(req, res, { 'chat_id': chat_id });
        }

        // TODO reengineer the code
        // change password
        // since mongoose doens't have pre hook for findByIdAndUpdate, so I'm going to hash my password here
        if (password) {
            bcrypt.genSalt(10, (error, salt) => {
                if (error) return next(error);
                bcrypt.hash(password, salt, (error, hash) => {
                    if (error) return next(error);
                    updateValue(req, res, { 'password': hash });
                });
            });
        }

        res.status(201).json({ 'message': 'Successfully updated info' });
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

            if (!user) return res.status(401).json({ 'message': 'User not found' });

            user.comparePassword(password, (err, matches) => {
                if (!err && matches) {
                    res.status(201).json(genToken(user.id));
                } else {
                    res.status(401).json({ 'message': 'Authentication failed, wrong password' });
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