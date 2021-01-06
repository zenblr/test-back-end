'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('digi_gold_customer_balance', 'non_sellable_gold_balance', {
      type: Sequelize.DataTypes.FLOAT,
      defaultValue: 0
    }).then(() => {
      return queryInterface.addColumn('digi_gold_customer_balance', 'non_sellable_silver_balance', {
        type: Sequelize.DataTypes.FLOAT,
        defaultValue: 0
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
