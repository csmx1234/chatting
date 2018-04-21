'use strict';

const userModel = require('../models/user');
const moment = require('moment');
const jwt = require('jwt-simple');
const config = require('../config');
const MALE = config.MALE;
const FEMALE = config.FEMALE;
const RANDOM = config.RANDOM;
const queue = require('../queue');
const hash = require('object-hash');

const decodeToken = function (token, callback) {
    try {
        const data = jwt.decode(token, config.secret);
        // return the id if no err
        callback(null, data.id);
    } catch (err) {
        // else return err message
        callback("Error: Token expired");
    }
};

// socket.io listening
const chatapp = function (io) {
    let ONLINE_USER = 0;
    let namespace = null;
    let ns = io.of(namespace || "/");

    io.on('connection', (socket) => {
        console.log(`connected to ${socket.id}`);
        let username = "";
        let user_id = "";
        let user_gender = MALE;
        let user_room = "";
        let user_node = null;
        let partner_node = null;
        let questions_picked = [{}];

        // sends user count
        io.to(socket.id).emit("user_count", ONLINE_USER);

        // link id and chat_id
        socket.on('send_token', (token, newConn) => {
            if (null == token) {
                io.to(socket).emit("kick_out", "invalid token");
                return;
            }

            token = token.split(" ")[1];

            decodeToken(token, (err, id) => {
                if (err) {
                    console.log(err + " " + socket.id);
                    io.to(socket.id).emit("kick_out", "登录超时，请重新登录");
                    return;
                }

                userModel.findByIdAndUpdate(id, { chat_id: socket.id, is_online: true }, { upsert: true }, (err, user) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    if (user) {
                        // kicks out old client if has old chat_id and not reconnecting
                        if (newConn && null != user.chat_id && undefined != ns.connected[user.chat_id]) {
                            // console.log(ns.connected[user.chat_id]);
                            io.to(user.chat_id).emit("kick_out", "您的账号已在其他设备上登录");
                            console.log(`kicked out old ${user.username} with chat_id ${user.chat_id}`);
                            newConn = false;
                        }

                        // join old room if exist
                        if (null != user.chat_room) {
                            console.log(`${user.username} rejoined the room ${user.chat_room}`)
                            io.in(user.chat_room).clients((err, clients) => {
                                if (err) {
                                    console.log(err);
                                    return;
                                }

                                // when reconnect, if partner has already left the room, do not rejoin the room
                                if (0 != clients.length) {
                                    socket.join(user.chat_room);
                                    socket.emit('new_match');
                                }

                                // otherwise removes the old room
                                else {
                                    userModel.findByIdAndUpdate(id, { chat_room: null }, (err, user) => {
                                        console.log(`removing the old room from database for ${user.username}`)
                                    });
                                }
                            })
                        }

                        // assign value to new socket (this socket)
                        username = user.username;
                        user_id = id;
                        user_gender = user.gender;
                        questions_picked = user.questions_picked;

                        // tell client user has joined
                        socket.emit("joined");

                        // update total count
                        if (newConn) {
                            ONLINE_USER++;
                            updateUserCount(io, ONLINE_USER);
                        }

                        console.log(`${user.username} has logged in`);
                    } else {
                        console.log(`${user.username} doesn't exist`);
                    }
                });
            });
        });

        // join room
        socket.on('new_match', getting_gender => {
            // const random_gender = (Math.random() * 10 > 5 ? MALE : FEMALE);
            const random_gender = (user_gender == MALE ? FEMALE : MALE);
            console.log(`getting new ${config.gendToStr(getting_gender)}${getting_gender == RANDOM ? ":" + config.gendToStr(random_gender) : ""} match for ${username}`);
            const data = { user_id: user_id, username: username, chat_id: socket.id, gender: user_gender, gender_pref: random_gender, questions_picked: questions_picked };

            // insert user into queue and get a node from it
            queue.insertUser(data, (node) => {
                user_node = node;
                console.log("got user node");
            });

            // user wait for couple seconds, then start to find partner
            queue.findPartner(user_node, (err, node) => {
                // cannot find partner within certain waiting time
                if (err) {
                    console.log(err);
                    return;
                }

                partner_node = node;
                console.log("got partner node");

                // check if users are online, if not tell self partner has left
                // TODO keep finding if partner has left during finding
                if (null == ns.connected[partner_node.chat_id]) {
                    console.log(`lost connection on ${partner_node.username}, quit now`);
                    io.to(socket.id).emit("partner_left_room");
                    return;
                }
                if (null == ns.connected[socket.id]) {
                    console.log(`lost connection on ${username}, quit now`);
                    io.to(partner_node.chat_id).emit("partner_left_room");
                    return;
                }

                // create user room by hashing both chat_id
                user_room = hash(socket.id + partner_node.chat_id + Date.now());
                user_node.new_room = user_room;
                partner_node.new_room = user_room;
                socket.join(user_room);
                ns.connected[partner_node.chat_id].join(user_room);
                console.log(`${username} and ${partner_node.username} joining room ${user_room}`);

                // updates status for both users
                userModel.findByIdAndUpdate(user_id, { chat_room: user_room, is_available: false }, { upsert: true }, (err, user) => {
                    // TODO handle err
                    if (err) console.log(err);
                    if (user) {
                        socket.emit('new_match');
                        console.log(`${user.username} has joined the room \"${user_room}\"`);
                    }
                    else
                        console.log("newMatch user not found");
                });
                userModel.findByIdAndUpdate(partner_node.user_id, { chat_room: user_room, is_available: false }, { upsert: true }, (err, user) => {
                    // TODO handle err
                    if (err) console.log(err);
                    if (user) {
                        ns.connected[partner_node.chat_id].emit('new_match');
                        console.log(`${user.username} has joined the room \"${user_room}\"`);
                    }
                    else
                        console.log("newMatch user not found");
                });
            });
        });

        // handles new message
        socket.on('new_message', data => {
            if ("" == user_room) {
                userModel.findById(user_id, (err, user) => {
                    user_room = user.chat_room;
                    console.log(`${username} says: ${data} to ${user_room}`);
                    socket.to(user_room).emit('message', username, data);
                })
            }
            else {
                console.log(`${username} says: ${data} to ${user_room}`);
                socket.to(user_room).emit('message', username, data);
            }
        });

        // leaves the room
        socket.on('leaving_room', () => {
            user_room = "";
            userModel.findByIdAndUpdate(user_id, { chat_room: null }, (err, user) => {
                // TODO handle err
                if (err) console.log(err);
                if (user) {
                    user_node = null;
                    partner_node = null;
                    io.to(socket.id).emit("i_left_room");
                    socket.to(user.chat_room).emit("partner_left_room");
                    socket.leave(user.chat_room);
                    console.log(`${username} is leaving the ${user.chat_room}`);
                }
                else
                    console.log("leaveRoom user not found");
            });
        });

        // removes user online status from database
        socket.on('disconnect', reason => {
            // removes the user from node if in the queue
            if (null != user_node) {
                queue.removeUser(user_node);
            }
            if (null != partner_node) {
                queue.removeUser(partner_node);
            }

            userModel.findOneAndUpdate({ chat_id: socket.id }, { chat_id: null, is_online: false, is_available: false }, (err, user) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (user) {
                    console.log(`${user.username} has logged out`);
                    ONLINE_USER--;
                    updateUserCount(io, ONLINE_USER);
                }
            });
        });
    })
};

// update user count
const updateUserCount = function (io, count) {
    io.emit("user_count", count);
    console.log(`updated usercount to ${count}`);
}

module.exports = chatapp;