'use strict';

module.exports = (sequelize, DataTypes) => {

  const Bill = sequelize.define('Bill', {
    bill: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.INTEGER,
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
  return Bill;
};


