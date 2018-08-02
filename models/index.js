'use strict';

const {User} = require('./user');
const {Bill} = require('./bill');
const {Category} = require('./category');
const {Transaction} = require('./transaction');

const db = {
  User,
  Bill,
  Category,
  Transaction
}

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
