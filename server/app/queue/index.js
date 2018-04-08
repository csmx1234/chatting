'use strict';
const async = require('async');
const userModel = require('../models/user');
const config = require('../config');
const male_queue = [];
const female_queue = [];
const user_map = {};
const UserQueue = {};

UserQueue.insertUser = function (user_id, gender, callback) {
    // based on gender move to different queue
    console.log(`inserting a ${config.gendToStr(gender)} with id ${user_id}`);
    if (gender == config.MALE) {
        male_queue.push(user_id);
        console.log(male_queue);
    } else if (gender == config.FEMALE) {
        female_queue.push(user_id);
        console.log(female_queue);
    }
    // hashmap to find user lock fast
    user_map[user_id] = { lock: false, finding: false, found: false };
    callback();
};

UserQueue.findParterner = async function (user_id, gender, callback) {
    callback();
};

module.exports = UserQueue;