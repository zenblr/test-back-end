'use strict';
const models = require('../models')

module.exports = {
  up: async(queryInterface, Sequelize) => {
    const allSchemes = await models.scheme.findAll({where:{isActive : true,schemeType:'secured',rpg:4000}})
    const allBranch = await models.internalBranch.findAll();
    // using for...of loop which supports awaiting inside it
    for await (const scheme of allSchemes) {
      for await(const branch of allBranch){
        await models.schemeInternalBranch.create({schemeId:scheme.id,internalBranchId:branch.id})
        console.log({schemeId:scheme.id,internalBranchId:branch.id})
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
