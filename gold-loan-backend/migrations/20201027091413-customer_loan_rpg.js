'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer_loan', 'rpg', {
      type: Sequelize.DataTypes.FLOAT,
      defaultValue: 3375
    })
  },

  down: (queryInterface, Sequelize) => {
  }
};
