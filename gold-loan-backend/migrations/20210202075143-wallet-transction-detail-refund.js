'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('wallet_transaction_details', 'product_name', {
      type: Sequelize.DataTypes.STRING,
    }).then(() => {
      return queryInterface.addColumn('wallet_transaction_details', 'is_from_refund_cron', {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
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
