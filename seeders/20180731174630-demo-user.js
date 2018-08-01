'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.bulkInsert('User', [{
        first_name: 'John',
        last_name: 'Doe',
        username: 'JDizzle',
        password: 'test-password',
        monthly_salary: 2000
      }], {});
  },

  down: (queryInterface, Sequelize) => {

      return queryInterface.bulkDelete('User', null, {});
  }
};
