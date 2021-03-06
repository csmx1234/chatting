"use strict";

// application dependencies
const express = require("express");
const cors = require("cors");
const app = express();
// const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// signed certificate
const options = {
  key: fs.readFileSync("./cert/key.pem"),
  cert: fs.readFileSync("./cert/server.crt")
};
// const server = https.createServer(options, app);
const server = http.createServer(app);
const io = require("socket.io")(server);

// app components
const config = require("./app/config");
const setup = require("./app/setup");
const routes = require("./app/routes");
const chatapp = require("./app/socket")(io);

// setup port and ip
const port = process.env.PORT || config.port;

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(routes);

// connect to database
mongoose.connect(config.database);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB conneciton error"));

// setup server first
if (!config.dev) setup();

server.listen(port);

module.exports = app;
