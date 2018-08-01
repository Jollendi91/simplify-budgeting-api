'use strict';

const Sequelize = require('sequelize');
const {sequelize} = require('../db/sequelize');

  const Bill = sequelize.define('Bill', {
    bill: {
      type: Sequelize.STRING,
      allowNull: false
    },
    amount: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'bills',
    underscored: true
  });
  
  Bill.associate = function(models) {
    Bill.belongsTo(
      models.User,
      {foreignKey: {allowNull: false}}
    );
  };
  
  Bill.prototype.apiRepr = function() {
    return {
      id: this.id,
      bill: this.bill,
      amount: this.amount
    }
  };
 
  module.exports = {
    Bill
  }

