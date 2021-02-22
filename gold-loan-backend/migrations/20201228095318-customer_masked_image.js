'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer' , 'aadhaar_masked_image1', {
      type: Sequelize.DataTypes.TEXT
    }).then(() => {
      return queryInterface.addColumn('customer' , 'aadhaar_masked_image2', {
        type: Sequelize.DataTypes.TEXT
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
