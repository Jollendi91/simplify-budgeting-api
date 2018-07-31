'use strict';

module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
  transaction: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
  }, 
  {
    tableName: 'transactions',
    underscored: true
  });

  Transaction.associate = function(models) {
    Transaction.belongsTo(
      models.Category,
      {foreignKey: {allowNull: false}}
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
return Transaction;
}
 