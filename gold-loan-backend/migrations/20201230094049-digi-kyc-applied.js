'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    return queryInterface.createTable('digi_kyc_applied',
      {
        id: {
          type: Sequelize.DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        customerId: {
          type: Sequelize.DataTypes.INTEGER,
          field: 'customer_id',
          references: {
            model: 'customer',
            key: 'id',
          }
        },
        status: {
          type: Sequelize.DataTypes.STRING,
          field: 'status'
        },
        createdAt: Sequelize.DataTypes.DATE,
        updatedAt: Sequelize.DataTypes.DATE,
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
