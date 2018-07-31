'use strict';

const Sequelize = require('sequelize');

const {sequelize} = require('../db/sequelize')

const Category = sequelize.define('Category', {
  category: {
    type: Sequelize.STRING,
    allowNull: false
  },
  amount: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, 
{
  tableName: 'categories',
  underscored: true
});

Category.associate = function(models) {
  Category.belongsTo(
    models.Author,
    {foreignKey: {allowNull: false}}
  );

  Category.hasMany(
    models.Transaction,
    {
      as: 'transactions',
      foreignKey: {allowNull: false}
    }
  );
};

Category.prototype.apiRepr = function() {
  return {
    id: this.id,
    category: this.category,
    amount: this.amount
  }
};

module.exports = {
  Category
}