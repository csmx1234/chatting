#!/bin/bash

#openssl req -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem
#openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt

#openssl req \
	#-newkey rsa:2048 \
	#-x509 \
	#-nodes \
	#-keyout key.pem \
	#-new \
	#-out server.crt \
	#-subj /CN=localhost \
	#-reqexts SAN \
	#-extensions SAN \
	#-config <(cat /System/Library/OpenSSL/openssl.cnf \
	#<(printf '[SAN]\nsubjectAltName=DNS:localhost')) \
	#-sha256 \
	#-days 365

cp {*.pem,*crt} ../../client/cert/.
cp {*.pem,*crt} ../../deployServer/.
