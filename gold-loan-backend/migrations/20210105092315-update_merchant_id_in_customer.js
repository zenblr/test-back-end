'use strict';
const models = require('../models')

module.exports = {
  up: async(queryInterface, Sequelize) => {
    await models.customer.update({ merchantId: 1 }, { where: { merchantId: null } })
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