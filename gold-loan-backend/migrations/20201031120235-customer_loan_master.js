'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    
    return queryInterface.addColumn('customer_loan_master', 'terms_and_condition', {
      type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.TEXT),
      defaultValue: []
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
