'use strict';

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.INTEGER,
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
  return Category;  
};

