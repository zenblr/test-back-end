'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('emi_navision_db_config', 'prefix', {
      type: Sequelize.DataTypes.STRING
    }).then(() => {
      return queryInterface.addColumn('emi_navision_db_config', 'module_name', {
        type: Sequelize.DataTypes.STRING
      })
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
