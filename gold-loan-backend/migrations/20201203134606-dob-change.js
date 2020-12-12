'use strict';
const models = require('../models')

module.exports = {

  up: async (queryInterface, Sequelize) => {
    // declare transaction outside try catch so it is available in both
    // const transaction = await queryInterface.sequelize.transaction()
    // try {
    await queryInterface.addColumn('customer', 'age', {
      type: Sequelize.DataTypes.STRING,
    })


    const customerPersonalDetails = await models.customerKycPersonalDetail.findAll()

    // using for...of loop which supports awaiting inside it
    for await (const single of customerPersonalDetails) {
      const customerId = single.customerId
      console.log(customerId)
      let { gender, age, dateOfBirth } = single
      let a = await models.customer.update({ gender, age, dateOfBirth }, { where: { id: customerId } })
      console.log(a)
    }

    //   await transaction.commit()
    // } catch (error) {
    //   // Rollback transaction if error occurs
    //   await transaction.rollback()
    //   console.error("Something went wrong: ", error)
    // }
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