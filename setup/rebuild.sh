#!/usr/bin/env bash

cd ..
gulp prod
npm install
bower install
pm2 gracefulReload pm2.json
