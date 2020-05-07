'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    // return queryInterface.addColumn('Person', 'petName', {
    //   type: Sequelize.DataTypes.STRING
    // }),
    return queryInterface.addColumn('city', 'slug', {
      type: Sequelize.DataTypes.STRING
    });
  },

  down: (queryInterface, Sequelize) => {

  }
};
