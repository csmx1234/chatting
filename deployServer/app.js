const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const options = {
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('server.crt')
}

app.use(express.static(path.resolve(__dirname, './dist')));

https.createServer(options, app).listen(8081);
