'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer', 'created_by_customer', {
      type: Sequelize.DataTypes.INTEGER,
    }).then(() => {
      return queryInterface.addColumn('customer', 'modified_by_customer', {
        type: Sequelize.DataTypes.INTEGER,
      })
    }).then(() => {
      return queryInterface.addColumn('customer', 'allow_customer_edit', {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: true
      })
    }).then(() => {
      return queryInterface.addColumn('customer', 'source_from', {
        type: Sequelize.DataTypes.INTEGER,
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
