#!/bin/bash
vim client/src/store/index.js 

# server
cd server
npm i
tmux kill-session -t 9
tmux new-session -d -s 9 'node index.js'
cd ..

# client
cd client
npm i
npm run build
./deploy.sh
cd ..

# deployserver
cd deployServer
npm i
tmux kill-session -t 8
tmux new-session -d -s 8 'node app.js'
cd ..
