'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer_loan_transfer', 'loan_transfer_status_for_appraiser', {
      type: Sequelize.DataTypes.ENUM,
      values: ['approved', 'pending', 'incomplete'],
      defaultValue: 'pending'
    });
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
