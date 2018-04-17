"use strict";

const socket = require('socket.io-client')('http://localhost:1234');
const queue = require('./queue');

socket.on('connect', function () {
    socket.emit('queue_server');

    socket.on('insert_user', (data, gender) => {
        console.log("something happened");
        queue.insertUser(data, gender);
    });
});