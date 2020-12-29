'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('wallet_details', 'order_type_id', {
      type: Sequelize.DataTypes.INTEGER,
      references: {
        model: 'digi_gold_order_type',
        key: 'id',
      }
    }).then(() => {
      return queryInterface.addColumn('wallet_details', 'payment_order_type_id', {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: 'digi_gold_order_type',
          key: 'id',
        },
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
