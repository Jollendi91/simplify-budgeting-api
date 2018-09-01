'use strict';

const Sequelize = require('sequelize');

const {
    DATABASE_URL, 
    DATABASE_NAME, 
    DATABASE_USERNAME, 
    DATABASE_PASSWORD, 
    SEQUELIZE_OPTIONS
} = require('../config/config');

console.log(`Connecting to database at ${DATABASE_URL}`);

let sequelize;

if (process.env.SIMPLIFY_DATABASE) {
    sequelize = new Sequelize(process.env.SIMPLIFY_DATABASE, SEQUELIZE_OPTIONS);
}else {
    sequelize = new Sequelize(DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, SEQUELIZE_OPTIONS);
};

module.exports = sequelize;