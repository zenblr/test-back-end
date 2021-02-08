'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('appraiser_request', 'internal_branch_id', {
      type: Sequelize.DataTypes.INTEGER,
      references: {
        model: 'loan_internal_branch',
        key: 'id',
      },
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
