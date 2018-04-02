'use strict';

const userModel = require('../models/user');

// socket.io listening
const chatapp = (io) => {
    io.on('connection', (socket) => {
        let chat_id = "";
        socket.emit('chat', 'PING');
        socket.on('chat', (id, data) => {
            chat_id = id;
            console.log(chat_id);
            console.log(data);
            socket.emit('chat', 'blah');
        });

        // removes user
        socket.on('disconnect', (reason) => {
            userModel.findOneAndUpdate({ chat_id: chat_id }, { chat_id: null, is_online: false }, (err, user) => {
                if (user)
                    console.log(`${user.username} has logged out`);
            });
        });
    })
};

module.exports = chatapp;