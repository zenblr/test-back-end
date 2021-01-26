'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer_kyc_organization_detail', 'created_by_customer', {
      type: Sequelize.DataTypes.INTEGER,
    }).then(() => {
      return queryInterface.addColumn('customer_kyc_organization_detail', 'modified_by_customer', {
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
