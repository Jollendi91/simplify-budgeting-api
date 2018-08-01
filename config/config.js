'use strict';

const dotenv = require('dotenv');
dotenv.config({path: './.env'});

const env = process.env.NODE_ENV || 'development';

const DATABASE_URL = (
  process.env.DATABASE_URL || 'postgres://localhost/dev-simplify-app'
);

const TEST_DATABASE_URL = (
  process.env.DATABASE_URL || 'postgres://localhost/test-simplify-app'
);

module.exports = {
  PORT: process.env.PORT || 8080,
  development: {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: "127.0.0.1",
    dialect: "postgres"
  },
  test: {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.TEST_DATABASE_URL,
    host: "127.0.0.1",
    dialect: "postgres"
  },
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "postgres"
  },
  DATABASE_NAME: env === 'test' ? process.env.TEST_DATABASE_NAME : process.env.DATABASE_NAME,
  DATABASE_USERNAME: process.env.DATABASE_USERNAME,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_URL: env === 'test' ? TEST_DATABASE_URL : DATABASE_URL,
  SEQUELIZE_OPTIONS: {
    logging: env === 'test' ? false : console.log,
    dialect: 'postgres'
  }
}
