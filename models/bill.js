'use strict';
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize');

const Bill = sequelize.define('Bill', {
	bill: {
		type: Sequelize.STRING,
		allowNull: false
	},
	amount: {
		type: Sequelize.DECIMAL,
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
		amount: parseFloat(this.amount).toFixed(2)
	}
};
 
module.exports = Bill;
	

