'use strict';

const Sequelize = require('sequelize');

const {sequelize} = require('../db/sequelize');


const Bill = sequelize.define('Bill', {
  bill: DataTypes.STRING,
  amount: DataTypes.MONEY
}, {});
Bill.associate = function(models) {
  // associations can be defined here
};
return Bill;
};