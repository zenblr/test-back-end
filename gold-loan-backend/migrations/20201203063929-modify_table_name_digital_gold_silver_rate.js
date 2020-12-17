'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameTable('digital_gold_silver_rate', 'digi_gold_silver_rate')
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
