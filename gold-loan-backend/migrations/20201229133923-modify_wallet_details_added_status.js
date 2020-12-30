'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('wallet_details', 'transaction_status', {
      type: Sequelize.DataTypes.ENUM,
      defaultValue: "pending",
      values: ['pending', 'completed', 'rejected']
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
