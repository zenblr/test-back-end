'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer_loan_transaction', 'customer_id', {
      type: Sequelize.DataTypes.INTEGER,
    }).then(() => {
      return queryInterface.addColumn('customer_loan_transaction', 'product_type_id', {
        type: Sequelize.DataTypes.INTEGER,
      });
    }).then(() => {
      return queryInterface.addColumn('customer_loan_transaction', 'running_balance', {
        type: Sequelize.DataTypes.FLOAT,
      });
    }).then(() => {
      return queryInterface.addColumn('customer_loan_transaction', 'free_balance', {
        type: Sequelize.DataTypes.FLOAT,
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
