'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('razor_temp_details', 'refund_cron_executed', {
      type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
    }).then(() => {
      return queryInterface.addColumn('digi_gold_temp_order_detail', 'refund_cron_executed', {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
      })
    }).then(() => {
      return queryInterface.addColumn('wallet_transaction_temp_details', 'refund_cron_executed', {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
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
