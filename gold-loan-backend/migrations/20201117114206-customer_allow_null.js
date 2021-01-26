'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    return queryInterface.changeColumn('customer', 'created_by', {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    }).then(() => {
      return queryInterface.changeColumn('customer', 'modified_by', {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
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
