'use strict';

const userModel = require('../models/user');
const jwt = require('jwt-simple');
const moment = require('moment');
const config = require('../config');

const setup = () => {

    // generate token
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

    // output
    userModel.findOne({ username: 'csm' }, function (err, user) {
        console.log('%s', genToken(user.id).token);
    });
};

module.exports = setup;