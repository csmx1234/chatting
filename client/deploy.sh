#!/bin/bash

rm -rf ../de*Server/dist
rm ../de*Server/index.html

cp -r ./dist ../de*Server/.
cp index.html ../de*Server/.
