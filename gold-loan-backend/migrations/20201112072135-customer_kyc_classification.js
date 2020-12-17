'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer_kyc_classification', 'created_by_customer', {
      type: Sequelize.DataTypes.INTEGER,
    }).then(() => {
      return queryInterface.addColumn('customer_kyc_classification', 'modified_by_customer', {
        type: Sequelize.DataTypes.INTEGER,
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
