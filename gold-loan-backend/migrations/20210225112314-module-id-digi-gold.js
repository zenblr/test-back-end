'use strict';
const models = require('../models')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('digi_kyc_applied', 'module_id', {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: 1
    })

    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
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
