'use strict';
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize');

const Category = sequelize.define('Category', {
	category: {
		type: Sequelize.STRING,
		allowNull: false
	},
	amount: {
		type: Sequelize.DECIMAL,
		allowNull: false
	}
}, 
{
	tableName: 'categories',
	underscored: true
});

Category.associate = function(models) {
	Category.hasMany(
		models.Transaction,
		{
			as: 'transactions',
			foreignKey: {allowNull: false},
			onDelete: 'CASCADE'
		}
	);
};

Category.prototype.apiRepr = function(transactions) {
	return {
		id: this.id,
		category: this.category,
		amount: parseFloat(this.amount).toFixed(2),
		transactions: transactions
	}
};

module.exports = Category;
