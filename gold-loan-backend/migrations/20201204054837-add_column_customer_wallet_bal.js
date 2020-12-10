'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer', 'current_wallet_balance', {
      type: Sequelize.DataTypes.FLOAT,
      defaultValue: 0
    }).then(() => {
      return queryInterface.addColumn('customer', 'wallet_free_balance', {
        type: Sequelize.DataTypes.FLOAT,
        defaultValue: 0
      });
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
