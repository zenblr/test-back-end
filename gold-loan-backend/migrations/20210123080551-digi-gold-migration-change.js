'use strict';
const models = require('../models')
const moment = require('moment')
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('digi_gold_order_detail', 'is_sellable_gold', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false
    })

    await queryInterface.addColumn('digi_gold_order_detail', 'is_sellable_silver', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false
    })

    let dateBeforSpcifiedTime = moment()
    let configSettingName = "digiGoldSellableHour"
    let duration = await models.digiGoldConfigDetails.getConfigDetail(configSettingName);

    let newDate = moment(dateBeforSpcifiedTime).subtract(Number(duration.configSettingValue), 'h').format('YYYY-MM-DD HH:mm:ss.SSS');

    let buyCustomer = await models.digiGoldOrderDetail.update({ is_sellable_gold: true, is_sellable_silver: true }, {
      where: {
        orderCreatedDate: { [Op.lt]: newDate },
        orderTypeId: 1
      }
    });

    let sellDelCustomer = await models.digiGoldOrderDetail.update({ is_sellable_gold: true, is_sellable_silver: true }, {
      where: {
        orderTypeId: { [Op.in]: [2, 3] }
      }
    });

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
