'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer_loan_master', 'is_loan_transfer_extra_amount_added', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false
    }).then(() => {
      return queryInterface.addColumn('customer_loan_master', 'loan_transfer_extra_amount', {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
      });
    })
  },
  down: (queryInterface, Sequelize) => {
  }
};
