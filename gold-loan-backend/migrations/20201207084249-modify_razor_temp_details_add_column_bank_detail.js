'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    return queryInterface.addColumn('razor_temp_details', 'cheque_number', {
      type: Sequelize.DataTypes.STRING,
    }).then(() => {
      return queryInterface.addColumn('razor_temp_details', 'bank_name', {
        type: Sequelize.DataTypes.STRING,
      });
    }).then(() => {
      return queryInterface.addColumn('razor_temp_details', 'branch_name', {
        type: Sequelize.DataTypes.STRING,
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
