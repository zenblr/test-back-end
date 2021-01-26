'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('wallet_transaction_temp_details', 'order_amount', {
      type: Sequelize.DataTypes.FLOAT
    }).then(() => {
      return queryInterface.addColumn('wallet_transaction_temp_details', 'metal_type', {
        type: Sequelize.DataTypes.STRING
      })
    }).then(() => {
      return queryInterface.addColumn('wallet_transaction_temp_details', 'qty_amt_type', {
        type: Sequelize.DataTypes.STRING
      })
    }).then(() => {
      return queryInterface.addColumn('wallet_transaction_temp_details', 'quantity', {
        type: Sequelize.DataTypes.FLOAT
      })
    }).then(() => {
      return queryInterface.addColumn('wallet_transaction_temp_details', 'type', {
        type: Sequelize.DataTypes.STRING
      })
    }).then(() => {
      return queryInterface.addColumn('wallet_transaction_temp_details', 'redirect_on', {
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
