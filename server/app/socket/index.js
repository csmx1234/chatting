'use strict';

const userModel = require('../models/user');
const moment = require('moment');
const jwt = require('jwt-simple');
const config = require('../config');
const MALE = config.MALE;
const FEMALE = config.FEMALE;
const RANDOM = config.RANDOM;
const Queue = require('../queue');
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
        let user_is_vip = false;
        let user_gender = MALE;
        let questions_picked = [{}];

        let partner_socket;
        socket.user_room = "";
        socket.user_node = null;
        socket.partner_node = null;
        socket.user_is_available = false;

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

                        // join old room if room exists and partner id exist as well
                        if (null != user.chat_room && null != user.partner_id) {
                            console.log(`${user.username} rejoining the room ${user.chat_room}`);
                            //io.in(user.chat_room).clients((err, clients) => {
                            //if (err) {
                            //console.log(err);
                            //return;
                            //}

                            // when reconnect, rejoin the room if still exist
                            //if (0 != clients.length) {
                            userModel.findById(user.partner_id, (err, partner) => {
                                if (err) {
                                    console.log(err);
                                    return
                                }

                                // if old room still exists
                                if (partner.chat_room == user.chat_room) {
                                    socket.join(user.chat_room);
                                    const partner_JSON = { is_vip: partner.is_vip, gender: config.gendToStr(partner.gender), questions_picked: partner.questions_picked }
                                    socket.emit('new_match', partner_JSON);
                                    console.log(`${user.username} rejoined the room ${user.chat_room}`);
                                }

                                // otherwise removes the old room
                                else {
                                    userModel.findByIdAndUpdate(id, { chat_room: null, partner_id: null }, (err, user) => {
                                        console.log(`removing the old room from database for ${user.username}`);
                                        io.to(socket.id).emit("partner_left_room");
                                    });
                                }
                            });
                            //}

                            //else {
                            //userModel.findByIdAndUpdate(id, { chat_room: null }, (err, user) => {
                            //console.log(`removing the old room from database for ${user.username}`)
                            //io.to(socket.id).emit("partner_left_room");
                            //});
                            //}
                            //})
                        }

                        // assign value to new socket (this socket)
                        username = user.username;
                        user_id = id;
                        user_is_vip = user.is_vip;
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
            // if user is already in the queue, do not add him back into the queue
            if (socket.user_is_available) {
                console.log(`${username} is already in queue`);
                return;
            }

            // otherwise updates user's availability
            socket.user_is_available = true;
            userModel.findByIdAndUpdate(user_id, { is_available: true }, { upsert: true }).exec();

            const random_gender = user_is_vip ? (user_gender == MALE ? FEMALE : MALE) : (Math.random() * 10 > 5 ? MALE : FEMALE);
            // const random_gender = (user_gender == MALE ? FEMALE : MALE);
            console.log(`getting new ${config.gendToStr(getting_gender)}${getting_gender == RANDOM ? ":" + config.gendToStr(random_gender) : ""} match for ${username}`);
            const data = { user_id: user_id, username: username, chat_id: socket.id, is_vip: user_is_vip, gender: user_gender, gender_pref: random_gender, questions_picked: questions_picked };

            // insert user into queue and get a node from it
            Queue.insertUser(data, (node) => {
                socket.user_node = node;
                console.log("got user node");
            });

            // user wait for couple seconds, then start to find partner
            Queue.findPartner(socket.user_node, (err, node) => {
                // cannot find partner within certain waiting time
                if (err) {
                    console.log(err);
                    return;
                }

                // assign user_node and partner_node to both sockets
                let user_node = socket.user_node;
                let partner_node = node;
                let partner_id = partner_node.chat_id;
                let user_room;
                socket.partner_node = node;
                partner_socket = ns.connected[partner_id];
                partner_socket.partner_node = user_node;
                console.log("got partner node");

                // check if partner and self are both online, if not tell self partner has left
                // TODO keep finding if partner has left during finding
                if (null == partner_socket) {
                    console.log(`lost connection on ${partner_node.username}, quit now`);
                    io.to(socket.id).emit("partner_left_room");
                    return;
                }

                if (null == ns.connected[socket.id]) {
                    console.log(`lost connection on ${username}, quit now`);
                    socket.to(partner_id).emit("partner_left_room");
                    return;
                }

                // create user room by hashing both chat_id and timestamp, saves the user room in both sockets and marks partner's queue node as found
                user_room = hash(socket.id + partner_id + Date.now());
                socket.user_room = user_room;
                partner_socket.user_room = user_room;
                partner_node.found = true;

                // let both socket join room
                socket.join(user_room);
                partner_socket.join(user_room);
                console.log(`${username} and ${partner_node.username} joining room ${user_room}`);

                // updates status for both users
                userModel.findByIdAndUpdate(user_id, { chat_room: user_room, partner_id: partner_node.user_id, is_available: false }, { upsert: true }, (err, user) => {
                    // TODO handle err
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (user) {
                        // TODO send more info
                        console.log("sending stuff");
                        socket.user_is_available = false;
                        socket.emit('new_match', partner_node.toJSON());
                        console.log(`${user.username} has joined the room \"${user_room}\"`);
                    }
                    else
                        console.log("newMatch user not found");
                });
                userModel.findByIdAndUpdate(partner_node.user_id, { chat_room: user_room, partner_id: user_id, is_available: false }, { upsert: true }, (err, user) => {
                    // TODO handle err
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (user) {
                        partner_socket.user_is_available = false;
                        partner_socket.emit('new_match', user_node.toJSON());
                        console.log(`${user.username} has joined the room \"${user_room}\"`);
                    }
                    else
                        console.log("newMatch user not found");
                });
            });
        });

        // handles new message
        socket.on('new_message', data => {
            if ("" == socket.user_room) {
                userModel.findById(user_id, (err, user) => {
                    socket.user_room = user.chat_room;
                    console.log(`${username} says: ${data} to ${socket.user_room}`);
                    socket.to(socket.user_room).emit('message', username, data);
                })
            }
            else {
                console.log(`${username} says: ${data} to ${socket.user_room}`);
                socket.to(socket.user_room).emit('message', username, data);
            }
        });

        // leaves the room
        socket.on('leaving_room', () => {
            socket.leave(socket.user_room);
            console.log(`${username} is leaving the ${socket.user_room}`);
            io.to(socket.id).emit("i_left_room");
            socket.to(socket.user_room).emit("partner_left_room");
            socket.user_room = "";
            socket.user_node = null;
            socket.partner_node = null;
            socket.user_is_available = false;

            // THIS IS ASYNC
            // TO THINK ABOUT: MAKE USER FIND NEW PARTNER AFTER DATABASE SYNC
            userModel.findByIdAndUpdate(user_id, { chat_room: null, partner_id: null, is_available: false }, (err, user) => {
                // TODO handle err
                if (err) console.log(err);
                if (user) {
                    console.log(`${username} has left the ${user.chat_room}`);
                }
                else
                    console.log("leaveRoom user not found");
            });
        });

        // removes user online status from database
        socket.on('disconnect', reason => {
            // removes the user from queue if quits while finding
            if (null != socket.user_node) {
                Queue.removeUser(socket.user_node);
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
