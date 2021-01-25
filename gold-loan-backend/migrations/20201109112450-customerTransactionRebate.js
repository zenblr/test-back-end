'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer_loan_transaction_detail', 'rebate_amount', {
      type: Sequelize.DataTypes.DECIMAL(10,2),
      defaultValue: 0
    });
  },

  down: (queryInterface, Sequelize) => {

  }
};
