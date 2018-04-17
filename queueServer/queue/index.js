'use strict';
const UserQueue = {};
// const async = require('async');
// const userModel = require('../models/user');
// const config = require('../config');
const MALE = 1;
const FEMALE = 0;
const RANDOM = 2;
const DoublyLinkedList = require('./DoublyLinkedList');
const male_queue = new DoublyLinkedList();
const female_queue = new DoublyLinkedList();
// const addon = require('../../build/Release/addon');

UserQueue.insertUser = function (data, gender, callback) {
    // based on gender move to different queue
    if (gender == MALE) {
        male_queue.enqueue(data);
        male_queue.print();
    } else if (gender == FEMALE) {
        female_queue.enqueue(data);
        female_queue.print();
    }
    callback();
};

UserQueue.removeUser = function (user_id, gender, callback) {
    callback();
};

// pairs up people in a loop
// const findInAnotherQueue = async function (this_queue, another_queue) {
//     let node = this_queue.getNode(0);
//     if (MALE == node.gender_pref) {

//     } else if (FEMALE == node.gender_pref) {

//     } else {

//     }
// }


const pairingMachine = function () {
    while (true) {
        console.log("helloworld");
    }
}
pairingMachine();
// setInterval(pairingMachine, 50);


module.exports = UserQueue;