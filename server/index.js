'use strict';

// application dependencies
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// app components
const config = require('./app/config');
const setup = require('./app/setup');
const routes = require('./app/routes');

// setup port
const port = process.env.PORT || config.port;

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(routes);

// connect to database
mongoose.connect(config.database);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB conneciton error'));

// test
if (config.TEST) setup();

app.listen(port);

module.exports = app;