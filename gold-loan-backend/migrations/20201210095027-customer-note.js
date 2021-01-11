'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer', 'suspicious_activity', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false
    }).then(() => {
      return queryInterface.addColumn('customer', 'note', {
        type: Sequelize.DataTypes.TEXT,
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
