'use strict';

// socket.io listening
const chatapp = (io) => {
    io.on('connection', (socket) => {
        //socket.emit('UPDATE_USER_INFO', 'PING');
        socket.on('chat', (data) => {
            console.log(data);
            socket.emit('chat', 'blah');
        });
    })
};

module.exports = chatapp;