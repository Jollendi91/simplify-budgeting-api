'use strict';
module.exports = (sequelize, DataTypes) => {
  var Bill = sequelize.define('Bill', {
    bill: DataTypes.STRING,
    amount: DataTypes.MONEY,
    userId: DataTypes.INTEGER
  }, {});
  Bill.associate = function(models) {
    // associations can be defined here
  };
  return Bill;
};