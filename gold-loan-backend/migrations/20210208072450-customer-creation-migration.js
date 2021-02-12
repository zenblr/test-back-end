'use strict';
const models = require('../models')
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
module.exports = {
  up: async (queryInterface, Sequelize) => {

    let getCustomerWithOutBranch = await models.customer.findAll({ where: { internalBranchId: null } })
    for (const singleCustomer of getCustomerWithOutBranch) {
      await models.customer.update({ internalBranchId: 1 }, { where: { id: singleCustomer.id } })
      console.log(singleCustomer.id, 1)
    }
    console.log('over')

    let getCompleteRequest = await models.appraiserRequest.findAll({ where: { status: 'complete' }, order: [['id', 'asc']] })
    for (const singleRequest of getCompleteRequest) {
      let getMasterLoan = await models.customerLoanMaster.findOne({ where: { appraiserRequestId: singleRequest.id } })
      if (getMasterLoan) {
        console.log(singleRequest.id, getMasterLoan.internalBranchId)
        await models.appraiserRequest.update({ internalBranchId: getMasterLoan.internalBranchId }, { where: { id: singleRequest.id } })
      } else {
        console.log(singleRequest.id, getMasterLoan)
      }
    }
    console.log('over')

    let getIncompleteRequest = await models.appraiserRequest.findAll({ where: { status: 'incomplete', isAssigned: true, appraiserId: { [Op.not]: null } } })
    for (const singleRequest of getIncompleteRequest) {
      let checkUser = await models.user.findOne({
        where: {
          id: singleRequest.appraiserId
        },
        include: [{
          model: models.internalBranch
        }]
      })
      let internalBranchId = checkUser.internalBranches[0].userInternalBranch.internalBranchId
      console.log(singleRequest.id, internalBranchId)
      await models.appraiserRequest.update({ internalBranchId: internalBranchId }, { where: { id: singleRequest.id } })
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
