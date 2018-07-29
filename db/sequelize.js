'use strict';

const Sequelize = require('sequelize');

const {DATABASE_URL, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME, SEQUELIZE_OPTIONS} = require('../config/config');

console.log(`Connecting to database at ${DATABASE_URL}`);

let sequelize = new Sequelize(DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, SEQUELIZE_OPTIONS);

module.exports = {
    sequelize
}