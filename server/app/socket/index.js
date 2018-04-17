'use strict';

const userModel = require('../models/user');
const moment = require('moment');
const jwt = require('jwt-simple');
const config = require('../config');
const MALE = config.MALE;
const FEMALE = config.FEMALE;
const RANDOM = config.RANDOM;
// const queue = require('../queue');

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
    let QUEUE_SERVER;
    let namespace = null;
    let ns = io.of(namespace || "/");

    io.on('connection', (socket) => {
        console.log(`connected to ${socket.id}`);
        let username = "";
        let user_id = "";
        let user_gender = MALE;
        let questions_picked = [{}];

        // sends user count
        io.to(socket.id).emit("user_count", ONLINE_USER);

        // establish connection to queue server
        socket.on('queue_server', () => {
            QUEUE_SERVER = socket.id;
            console.log("got queue server");
        });

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
                            socket.join(user.chat_room);
                            socket.emit('new_match');
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

        // TODO join room
        socket.on('new_match', getting_gender => {
            console.log(`getting new ${config.gendToStr(getting_gender)} match for ${username}`);
            const data = { user_id: user_id, username: username, chat_id: socket.id, gender_pref: RANDOM, questions_picked: questions_picked };
            if (null != QUEUE_SERVER) {
                socket.to(QUEUE_SERVER).emit("insert_user", data, user_gender);
            } else {
                console.log("Err: queue server is down");
            }
            // queue.insertUser(data, user_gender, (err) => {
            // TODO handle err
            // });
            const room = "room";
            socket.join(room);
            userModel.findByIdAndUpdate(user_id, { chat_room: room }, { upsert: true }, (err, user) => {
                // TODO handle err
                if (err) console.log(err);
                if (user) {
                    socket.emit('new_match');
                    console.log(`${user.username} has joined the room \"${room}\"`);
                }
                else
                    console.log("newMatch user not found");
            });
        });

        // leaves the room
        socket.on('leaving_room', () => {
            userModel.findByIdAndUpdate(user_id, { chat_room: null }, (err, user) => {
                // TODO handle err
                if (err) console.log(err);
                if (user) {
                    socket.leave(user.chat_room);
                    console.log(`${username} is leaving the ${user.chat_room}`);
                    socket.emit("left_Room");
                }
                else
                    console.log("leaveRoom user not found");
            });
        });

        // handles new message
        socket.on('new_message', data => {
            console.log(`${username} says: ${data}`);
            socket.to('room').emit('message', username, data);
        });

        // removes user online status from database
        socket.on('disconnect', reason => {
            userModel.findOneAndUpdate({ chat_id: socket.id }, { chat_id: null, is_online: false }, (err, user) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (user) {
                    if (null != user.room)
                        socket.leave(user.room);
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