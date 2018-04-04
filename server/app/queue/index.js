'use strict';
const async = require('async');
const userModel = require('../models/user');
let queue = [];
const UserQueue = {};

UserQueue.insertUser = function (user_id, callback) {
    console.log("inserting " + user_id);
    queue.push(user_id);
    console.log(queue);
    callback();
};

UserQueue.findParterner = async function (user_id, callback) {
    let brk = false;
    while (!brk && queue.length != 0) {
        let a_user = queue.shift();
        if ( a_user == user_id ) queue.unshift();

        // check self status
        await userModel.findOne({ _id: user_id }, (err, user_self) => {
            if ( user_self.available == false ) {
                brk = true;
            }
        });

        // find another user
        await userModel.findOne({ _id: a_user, available: true }, (err, user) => {
            if (user) {
                console.log("found one");
                user.available = false;
                // return a_user id
                brk = true;
            } else {
                console.log("didn't find one");
            }
        });
        console.log(queue);
    }
    callback();
};

// UserQueue.insertUser("5abe738d7e2fa21a37a36898", function (err) {
    // console.log('inserted a user');
// });

// UserQueue.findParterner("5abe738d7e2fa21a37a36898", function (err) {
// });

module.exports = UserQueue;