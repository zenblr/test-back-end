'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('error_logger', 'message', {
      type: Sequelize.DataTypes.TEXT
    })
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
