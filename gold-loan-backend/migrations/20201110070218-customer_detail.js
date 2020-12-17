'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer', 'customer_address', {
      type: Sequelize.DataTypes.TEXT,
    }).then(() => {
      return queryInterface.addColumn('customer', 'gender', {
        type: Sequelize.DataTypes.STRING,
      });
    }).then(() => {
      return queryInterface.addColumn('customer', 'date_of_birth', {
        type: Sequelize.DataTypes.DATE,
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
