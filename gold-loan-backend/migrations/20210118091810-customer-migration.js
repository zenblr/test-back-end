'use strict';

const models = require('../models')
const uniqid = require('uniqid');
let { getUserData, createCustomer } = require('../service/digiGold')

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.changeColumn('customer', 'customer_unique_id', {
      type: Sequelize.DataTypes.STRING,
      unique: true
    })

    await queryInterface.addColumn('customer', 'is_augmont_customer_created', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false
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
