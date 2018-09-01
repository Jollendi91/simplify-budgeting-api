'use strict';
const dotenv = require('dotenv');
dotenv.config();

const {PORT} = require('../config/config');
const {runServer, closeServer} = require('../server');
const sequelize = require('../db/sequelize');

before(function() {
    return sequelize
        .sync({force: true})
        .then(() => runServer(PORT));
});

after(function() {
    return closeServer();
});