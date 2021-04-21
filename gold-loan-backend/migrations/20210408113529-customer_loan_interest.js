'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer_loan_interest', 'interest_paid_from', {
      type: Sequelize.DataTypes.ENUM,
      defaultValue: 'quickPay',
      values: ['quickPay', 'partPayment']
    }).then(() => {
      return queryInterface.addColumn('customer_loan_interest', 'interest_amt_paid_during_quick_pay', {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      })
    }).then(() => {
      return queryInterface.addColumn('customer_loan_interest', 'is_part_payment_ever_received', {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
      })
    })
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
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
