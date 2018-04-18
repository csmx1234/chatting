'use strict';

const UserQueue = {};
const async = require('async');
const userModel = require('../models/user');
const config = require('../config');
const MALE = config.MALE;
const FEMALE = config.FEMALE;
const DoublyLinkedList = require('./DoublyLinkedList');
const male_queue = new DoublyLinkedList();
const female_queue = new DoublyLinkedList();
// const addon = require('../../build/Release/addon');

UserQueue.findPartner = function (data, callback) {
    // select gender queue, make a new node, push to queue, print queue
    const my_queue = (data.gender == MALE ? male_queue : female_queue);
    console.log(`my_queue is ${my_queue === male_queue ? "male_queue" : "female_queue"}`)
    const my_queue_obj = my_queue.enqueue(data);
    my_queue.print();

    // wait for several seconds for other candidates to join
    setTimeout(() => {
        console.log(`${data.username} starts to find candidates`);
        // if has already been picked up by other people, just leave
        if (null != my_queue_obj.new_room) {
            callback(`Err: ${data.username} has been taken`);
            return;
        }

        // otherwise find a partner in the queue, within candidate count, max candidate count, queue length
        else {
            const searching_queue = (my_queue_obj.gender_pref == MALE ? male_queue : female_queue);
            console.log(`searching_queue is ${searching_queue === male_queue ? "male_queue" : "female_queue"}`)
            let itr = searching_queue.getNode(0);
            let most_optimal = null;
            let tried_candidates = 0;
            let searched_candidates = 0;
            let matching_percent = 0;

            // loop through candidates from old to new in the gender queue
            while (null != itr && tried_candidates != config.candidate_count && searched_candidates != config.max_candidate_count) {
                console.log(`${data.username} is visiting ${itr.username}`);
                if (itr.user_id == my_queue_obj.user_id || my_queue_obj.gender != itr.gender_pref || null != itr.new_room) {
                    itr = itr.next;
                    console.log("passed");
                } else if (my_queue_obj.gender == itr.gender_pref) {
                    // TODO write matching algorithm
                    const this_matching_percent = Math.round(Math.random() * 100);
                    if (this_matching_percent > matching_percent) {
                        most_optimal = itr;
                        matching_percent = this_matching_percent;
                        itr = itr.next;
                        console.log("set as candidate");
                    }
                    tried_candidates++;
                }
                searched_candidates++;
            }

            // if no optimal candidate, keep waiting in the queue, time out on client side
            if (null == most_optimal) {
                // my_queue.remove(my_queue_obj);
                callback("Err: cannot find candidate");
            }

            // if found candidate, remove both nodes from queue, send nodes back to callback to handle
            else {
                callback(null, my_queue_obj, most_optimal);
                my_queue.remove(my_queue_obj);
                searching_queue.remove(most_optimal);
            }
        }
    }, config.waiting_time);
};

UserQueue.removeUser = function (user_id, gender, callback) {
    callback();
};

module.exports = UserQueue;