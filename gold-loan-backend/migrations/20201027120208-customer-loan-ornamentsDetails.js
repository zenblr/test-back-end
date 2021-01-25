'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer_loan_ornaments_detail', 'evaluation', {
      type: Sequelize.DataTypes.FLOAT,
    }).then(() => {
      return queryInterface.removeColumn('customer_loan_ornaments_detail', 'current_gold_rate');
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
