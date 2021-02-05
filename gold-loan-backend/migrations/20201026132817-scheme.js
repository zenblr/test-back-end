'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('loan_scheme', 'rpg', {
      type: Sequelize.DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 3375
    }).then(() => {
      return queryInterface.addColumn('loan_scheme', 'unsecured_scheme_id', {
        type: Sequelize.DataTypes.INTEGER,
        reference: {
          model: 'loan_scheme',
          field: 'id'
        }
      });
    }).then(() => {
      return queryInterface.removeColumn('loan_scheme', 'maximum_percentage_allowed');
    }).then(() => {
      return queryInterface.removeColumn('loan_scheme', 'default');
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
