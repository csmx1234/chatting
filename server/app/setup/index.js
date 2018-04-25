'use strict';

const userModel = require('../models/user');
const config = require('../config');

const setup = function () {
    // clean up database
    userModel.updateMany({}, {is_online: false, is_available: false}).exec();
};

module.exports = setup;