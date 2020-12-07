'use strict';

const models = require('../models')


module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.addColumn('customer', 'form60_image', {
      type: Sequelize.DataTypes.TEXT,
    })


    const customerDetails = await models.customer.findAll()

    // using for...of loop which supports awaiting inside it
    for await (const single of customerDetails) {
      const id = single.id
      console.log(id)
      let { panType, panImage, panCardNumber } = single
      if (panType == "form60") {
        let a = await models.customer.update({ form60Image: panImage, panImage: null }, { where: { id: id } })
        console.log(a)
        console.log(panType, panImage)

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
