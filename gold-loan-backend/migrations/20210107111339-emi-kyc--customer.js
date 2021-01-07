'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer', 'emi_kyc_status', {
      type: Sequelize.DataTypes.ENUM,
      defaultValue: "pending",
      values: ['approved', 'pending', 'rejected']
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
