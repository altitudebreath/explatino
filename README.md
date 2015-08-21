explatino
========================

Classic client-server boilerplate using vanilla Express 4, 

Features
------------

* Database: MySQL/MariaDB using node-mysql2. Potentially others may be integrated.
* Anti-ORM model-like simple classes for queries of any complexity.
* Authentication using Passport.js
* Bluebird promises in models
* Gulp for project management
* PM2 for deployment and production

Getting started
---------------------

npm install -g pm2, gulp

Clone the repo

``` git clone https://github.com/altitudebreath/explatino.git
```
npm install

* For development
gulp


* For production
gulp prod

edit pm2.json
pm2 deploy pm2.json

Credits
------------------

Assets structure, Passport code and more were taken from 
[MEAN.js](https://github.com/meanjs/mean) 
