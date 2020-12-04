'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer_loan_disbursement', 'bank_transfer_type', {
      type: Sequelize.DataTypes.STRING
    })
  },

  down: (queryInterface, Sequelize) => {
   
  }
};
