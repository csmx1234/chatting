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

// for testing
if (config.dev) {
    userModel.findOneAndUpdate({ username: "csm" }, { is_vip: true }).exec();
}

// select gender queue, make a new node, push to queue, print queue, and return the node object
UserQueue.insertUser = function (data, callback) {
    const my_queue = (data.gender == MALE ? male_queue : female_queue);
    console.log(`my_queue is ${my_queue === male_queue ? "male_queue" : "female_queue"}`)
    const my_node = my_queue.enqueue(data);
    if (null == my_node) {
        callback("Err: user already in queue");
        return;
    }
    callback(null, my_node);
    my_queue.print();
}

UserQueue.findPartner = function (my_queue_obj, callback) {
    // boundary check, if my_queue_obj is null, return err
    if (null == my_queue_obj) {
        callback("Err: user has already been taken, and partner has already left");
        return;
    }

    const my_queue = (my_queue_obj.gender == MALE ? male_queue : female_queue);

    // wait for several seconds for other candidates to join
    setTimeout(() => {
        // boundary check, if quits matching in the middle, return err
        if (my_queue_obj.quit_matching) {
            callback(`Err: ${my_queue_obj.username} quits matching`);
            return;
        }

        let searching_queue = (my_queue_obj.gender_pref == MALE ? male_queue : female_queue);
        console.log(`searching_queue is ${searching_queue === male_queue ? "male_queue" : "female_queue"} and i am ${my_queue_obj.username}`)
        console.log(`${config.gendToStr(my_queue_obj.gender_pref)} searching queue has count of: ${searching_queue.count}`);
        // if the searching queue is empty, see if user is vip, if not, automatically switch gender preference
        if (0 == searching_queue.count || (1 == searching_queue.count && my_queue_obj.gender == my_queue_obj.gender_pref)) {
            if (my_queue_obj.is_vip) {
                callback("Err: opposite gender queue is empty");
                return;
            } else {
                my_queue_obj.gender_pref = (my_queue_obj.gender_pref == MALE ? FEMALE : MALE);
                searching_queue = (my_queue_obj.gender_pref == MALE ? male_queue : female_queue);

                console.log(`${config.gendToStr(my_queue_obj.gender_pref)} searching queue has count of: ${searching_queue.count}`);
                // if the queue is still empty, it means there's no one online
                if (0 == searching_queue.count || (1 == searching_queue.count && my_queue_obj.gender == my_queue_obj.gender_pref)) {
                    callback("Err: empty queues");
                    return;
                }
            }
        }

        let itr = searching_queue.getNode(0);
        let most_optimal = null;
        let tried_candidates = 0;
        let searched_candidates = 0;
        let matching_percent = 0;

        console.log(`${my_queue_obj.username} starts to find candidates and my_queue_obj.found is ${my_queue_obj.found}`);
        // if has already been picked up by other people, just leave
        if (my_queue_obj.found) {
            callback(`Err: ${my_queue_obj.username} has been taken`);
            return;
        }

        // otherwise find a partner in the queue, within candidate count, max candidate count, queue length
        else {
            // loop through candidates from old to new in the gender queue
            while (searching_queue.tail != itr && tried_candidates != config.candidate_count && searched_candidates != config.max_candidate_count) {
                searching_queue.print();
                console.log(`${my_queue_obj.username} is visiting ${itr.username}`);
                if (itr.user_id == my_queue_obj.user_id || null != itr.new_room) {
                    itr = itr.next;
                    console.log("passed");
                } else {
                    if (itr.is_vip && my_queue_obj.gender != itr.gender_pref) {
                        console.log(`passed itr_is_vip: ${itr.is_vip} my_queue_obj.gender: ${my_queue_obj.gender} itr_gender_pref: ${itr.gender_pref}`);
                    }
                    if (!itr.is_vip || (itr.is_vip && my_queue_obj.gender == itr.gender_pref)) {
                        // TODO write matching algorithm
                        const this_matching_percent = Math.round(Math.random() * 100);
                        if (this_matching_percent > matching_percent) {
                            most_optimal = itr;
                            matching_percent = this_matching_percent;
                            console.log("set as candidate");
                        }
                        tried_candidates++;
                    }
                    itr = itr.next;
                }
                searched_candidates++;
            }

            // if no optimal candidate, keep waiting in the queue, time out on client side
            if (null == most_optimal) {
                // my_queue.remove(my_queue_obj);
                callback("Err: cannot find candidate");
                return;
            }

            // if found candidate, remove both nodes from queue, send nodes back to callback to handle
            else {
                callback(null, most_optimal);
                my_queue.remove(my_queue_obj);
                searching_queue.remove(most_optimal);
                return;
            }
        }
    }, config.waiting_time);
};

UserQueue.printQueue = function (gender) {
    const searching_queue = (gender == MALE ? male_queue : female_queue);
    searching_queue.print();
};

UserQueue.removeUser = function (my_queue_obj) {
    console.log(`removing ${my_queue_obj.username}`);
    const my_queue = (my_queue_obj.gender == MALE ? male_queue : female_queue);
    my_queue.remove(my_queue_obj);
};

module.exports = UserQueue;