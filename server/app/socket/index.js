'use strict';

// socket.io listening
const chatapp = (io) => {
    io.on('connection', (socket) => {
        socket.on('chat', (data)=> {
            console.log(data);
            socket.emit('chat', 'blah');
        });
    })
};

module.exports = chatapp;