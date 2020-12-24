'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('wallet_transaction_details', 'account_holder_name', {
      type: Sequelize.DataTypes.STRING
    }).then(() => {
      return queryInterface.addColumn('wallet_transaction_details', 'account_number', {
        type: Sequelize.DataTypes.STRING
      })
    }).then(() => {
      return queryInterface.addColumn('wallet_transaction_details', 'ifsc_code', {
        type: Sequelize.DataTypes.STRING
      })
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
