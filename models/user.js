'use strict';

const bcrypt = require('bcryptjs');

const Sequelize = require('sequelize');
const {sequelize} = require('../db/sequelize');
   
  const User = sequelize.define('User', {
    firstName: {
      type: Sequelize.STRING,
      field: 'first_name'
    },
    lastName: {
      type: Sequelize.STRING,
      field: 'last_name'
    },
    username: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    setupStep: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      field: 'setup_step'
    },
    monthlySalary: {
      type: Sequelize.DECIMAL,
      defaultValue: 0,
      field: 'monthly_salary'
    }
  }, {
    tableName: 'users',
    underscored: true
  });
  User.associate = function(models) {
    User.hasMany(
      models.Bill,
      {
        as: 'bills',
        foreignKey: {allowNull: false}
      }
    );

    User.hasMany(
      models.Category,
      {
        as: 'categories',
        foreignKey: {
          as: 'user_id',
          allowNull: false
        }
      }
    );
  };

  User.prototype.apiRepr = function() {
    return {
      id: this.id,
      username: this.username,
      setupStep: this.setupStep,
      monthlySalary: this.monthlySalary 
    }
  };

  User.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
  };

  User.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
  };

module.exports = {
  User
}