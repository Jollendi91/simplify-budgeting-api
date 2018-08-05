'use strict';

const Sequelize = require('sequelize');
const {sequelize} = require('../db/sequelize');


  const Transaction = sequelize.define('Transaction', {
  transaction: {
    type: Sequelize.STRING,
    allowNull: false
  },
  date: {
    type: Sequelize.DATEONLY,
    allowNull: false
  },
  amount: {
    type: Sequelize.DECIMAL,
    allowNull: false
  }
  },{
    tableName: 'transactions',
    underscored: true
  });

  Transaction.associate = function(models) {
    Transaction.belongsTo(
      models.Category,
      {
        foreignKey: {allowNull: false},
        onDelete: 'CASCADE'
      }
    );
  };

  Transaction.prototype.apiRepr = function() {
    return {
      id: this.id,
      transaction: this.transaction,
      date: this.date,
      amount: this.amount
    }
};


module.exports = {
  Transaction
}