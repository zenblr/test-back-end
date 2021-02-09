'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('loan_global_setting', 'confidence_pan', {
      type: Sequelize.DataTypes.FLOAT
    }).then(() => {
      return queryInterface.addColumn('loan_global_setting', 'confidence_aadhar', {
        type: Sequelize.DataTypes.FLOAT
      })
    }).then(() => {
      return queryInterface.addColumn('loan_global_setting', 'confidence_name', {
        type: Sequelize.DataTypes.FLOAT
      })
    }).then(() => {
      return queryInterface.addColumn('loan_global_setting_history', 'confidence_pan', {
        type: Sequelize.DataTypes.FLOAT
      })
    }).then(() => {
      return queryInterface.addColumn('loan_global_setting_history', 'confidence_aadhar', {
        type: Sequelize.DataTypes.FLOAT
      })
    }).then(() => {
      return queryInterface.addColumn('loan_global_setting_history', 'confidence_name', {
        type: Sequelize.DataTypes.FLOAT
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
