'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer_loan', 'rpg', {
      type: Sequelize.DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 4000
    })
  },

  down: (queryInterface, Sequelize) => {
  }
};
