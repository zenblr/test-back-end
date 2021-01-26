'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    return queryInterface.createTable('customer_augmont_city',
      {
        id: {
          type: Sequelize.DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        city_id: {
          type: Sequelize.DataTypes.INTEGER,
        },
        customer_id: {
          type: Sequelize.DataTypes.INTEGER
        }
      }
    )

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
