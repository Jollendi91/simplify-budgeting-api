'use strict';

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
      field: 'setup-step'
    },
    monthlySalary: {
      type: Sequelize.MONEY,
      field: 'monthly_salary'
    }
  }, {
    tableName: 'users',
    underscored: true
  });
  User.associate = function(models) {
    // associations can be defined here
  };

  User.prototype.apiRepr = function() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      setupStep: this.setupStep,
      monthlySalary: this.monthlySalary
    }
  };

  module.exports ={
    User
  };
  