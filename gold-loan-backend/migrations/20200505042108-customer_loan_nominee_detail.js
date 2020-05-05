'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    // return queryInterface.addColumn('Person', 'petName', {
    //   type: Sequelize.DataTypes.STRING
    // }),
    return queryInterface.addColumn('customer_loan_nominee_detail', 'nominee_id', {
      type: Sequelize.DataTypes.STRING
    });
  },

  down: (queryInterface, Sequelize) => {

  }
};
