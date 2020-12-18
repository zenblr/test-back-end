'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('source', [{
      source_name: 'ADMIN_PANEL',
      source_point: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      source_name: 'CUSTOMER_WEBSITE',
      source_point: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      source_name: 'CUSTOMER_APP',
      source_point: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
