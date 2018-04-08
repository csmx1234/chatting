'use strict';

const userModel = require('../models/user');
const moment = require('moment');
const jwt = require('jwt-simple');
const config = require('../config');
const queue = require('../queue');

const decodeToken = (token, callback) => {
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
const chatapp = (io) => {
    let namespace = null;
    let ns = io.of(namespace || "/");

    io.on('connection', (socket) => {
        console.log(`connected to ${socket.id}`);
        let username = "";
        let user_id = "";
        let user_gender = false;

        // link id and chat_id
        socket.on('sendToken', (token, isRecon) => {
            if (null == token) {
                io.to(socket).emit("kickout", "invalid token");
                return;
            }

            token = token.split(" ")[1];

            decodeToken(token, (err, id) => {
                if (err) {
                    console.log(err + " " + socket.id);
                    io.to(socket.id).emit("kickout", "登录超时，请重新登录");
                    return;
                }

                userModel.findByIdAndUpdate(id, { chat_id: socket.id, is_online: true }, { upsert: true }, (err, user) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    if (user) {
                        // tell client user has joined
                        socket.emit("joined");

                        // kicks out old client if has old chat_id and not reconnecting
                        if (!isRecon && null != user.chat_id) {
                            // if (undefined != ns.connected[user.chat_id])
                            // ns.connected[user.chat_id].disconnect(true);
                            io.to(user.chat_id).emit("kickout", "您的账号已在其他设备上登录");
                            console.log(`kicked out old ${user.username} with chat_id ${user.chat_id}`);
                        }

                        // join old room if exist
                        if (null != user.chat_room) {
                            console.log(`${user.username} rejoined the room ${user.chat_room}`)
                            socket.join(user.chat_room);
                        }

                        // assign value to local scope
                        username = user.username;
                        user_id = id;
                        user_gender = user.gender;

                        console.log(`${user.username} has logged in`);
                    } else {
                        console.log(`${user.username} doesn't exist`);
                    }
                });
            });
        });

        // TODO join room
        socket.on('newMatch', getting_gender => {
            console.log(`getting new ${config.gendToStr(getting_gender)} match for ${username}`);
            queue.insertUser(user_id, user_gender, (err) => {
                // TODO handle err
            });
            const room = "room";
            socket.join(room);
            userModel.findByIdAndUpdate(user_id, { chat_room: room }, { upsert: true }, (err, user) => {
                // TODO handle err
                if (err) console.log(err);
                if (user) {
                    socket.emit('newMatch');
                    console.log(`${user.username} has joined the room \"${room}\"`);
                }
                else
                    console.log("newMatch user not found");
            });
        });

        // leaves the room
        socket.on('leaveRoom', () => {
            userModel.findByIdAndUpdate(user_id, { chat_room: null }, (err, user) => {
                // TODO handle err
                if (err) console.log(err);
                if (user) {
                    socket.leave(user.chat_room);
                    console.log(`${username} is leaving the ${user.chat_room}`);
                    socket.emit("leftRoom");
                }
                else
                    console.log("leaveRoom user not found");
            });
        });

        // handles new message
        socket.on('newMsg', data => {
            console.log(data);
            socket.to('room').emit('msg', username, data);
        });

        // removes user online status from database
        socket.on('disconnect', (reason) => {
            userModel.findOneAndUpdate({ chat_id: socket.id }, { chat_id: null, is_online: false }, (err, user) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (user) {
                    if (null != user.room)
                        socket.leave(user.room);
                    console.log(`${user.username} has logged out`);
                }
            });
        });
    })
};

module.exports = chatapp;