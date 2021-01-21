'use strict';
const models = require('../models')
const uniqid = require('uniqid');

module.exports = {
  up: async (queryInterface, Sequelize) => {

    let customersWithoutUniqueId = await models.customer.findAll({ where: { customerUniqueId: null }, order: [['id', 'asc']] })

    for (let i = 0; i < customersWithoutUniqueId.length; i++) {
      let singleCustomer = customersWithoutUniqueId[i];

      if (singleCustomer.customerUniqueId == null) {
        console.log(singleCustomer.id)
        let checkCustomerUniqueId = false
        var customerUniqueId = null;
        do {

          customerUniqueId = uniqid.time().toUpperCase();

          let checkUniqueCustomerUniqueId = await models.customer.findOne({ where: { customerUniqueId: customerUniqueId } })
          if (!checkUniqueCustomerUniqueId) {
            checkCustomerUniqueId = true
          }
        }
        while (!checkCustomerUniqueId);

        let a = await models.customer.update({ customerUniqueId: customerUniqueId }, { where: { id: singleCustomer.id } });
        console.log(a, customerUniqueId)
      }

    }


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
