'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer_loan_interest', 'highest_interest_amount', {
      type: Sequelize.DataTypes.DECIMAL(10,2),
      defaultValue: 0
    }).then(() => {
      return queryInterface.addColumn('customer_loan_interest', 'rebate_amount', {
        type: Sequelize.DataTypes.DECIMAL(10,2),
        defaultValue: 0
      });
    }).then(() => {
      return queryInterface.addColumn('customer_loan_interest', 'rebate_interest_rate', {
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
