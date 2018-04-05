'use strict';

const userModel = require('../models/user');
const moment = require('moment');
const jwt = require('jwt-simple');
const config = require('../config');

const decodeToken = (token, callback) => {
    const cur_time = moment().utc().unix();
    const data = jwt.decode(token, config.secret);

    // if token is expired
    if (cur_time > data.exp) {
        callback("token is expired");
        return;
    }

    // else just return the id
    callback(null, data.id);
};

// socket.io listening
const chatapp = (io) => {
    io.on('connection', (socket) => {
        console.log(`connected to ${socket.id}`);
        let username = "";

        // link id and chat_id
        socket.on('sendToken', (token) => {
            token = token.split(" ")[1];

            decodeToken(token, (err, id) => {
                if (err) {
                    console.log(err);
                    return;
                }

                userModel.findByIdAndUpdate(id, { chat_id: socket.id, is_online: true }, { upsert: true }, (err, user) => {
                    if (err) throw err;

                    if (user) {
                        // tell client user has joined
                        socket.emit("joined");
                        // kicks out old client
                        if (null != user.chat_id) {
                            io.to(user.chat_id).emit("kickout", "您的账号已在其他设备上登录");
                            console.log(`kicked out old ${user.username}`);
                        }
                        // join old room if exist
                        if (null != user.chat_room) {
                            socket.join(chat_room);
                        }
                        username = user.username;
                        console.log(`${user.username} has logged in`);
                    } else {
                        console.log(`${user.username} doesn't exist`);
                    }
                });
            });
        });

        // TODO join room
        socket.join('room');

        // handles new message
        socket.on('newMsg', data => {
            console.log(data);
            socket.to('room').emit('msg', username, data);
        });

        // removes user online status from database
        socket.on('disconnect', (reason) => {
            userModel.findOneAndUpdate({ chat_id: socket.id }, { chat_id: null, is_online: false }, (err, user) => {
                if (err) throw err;
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