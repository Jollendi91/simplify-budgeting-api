'use strict';

 module.exports = (sequelize, DataTypes) => { 
   
  const User = sequelize.define('User', {
    firstName: {
      type: DataTypes.STRING,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING,
      field: 'last_name'
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    setupStep: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: 'setup_step'
    },
    monthlySalary: {
      type: DataTypes.INTEGER,
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
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      setupStep: this.setupStep,
      monthlySalary: this.monthlySalary
    }
  };
  return User;
};