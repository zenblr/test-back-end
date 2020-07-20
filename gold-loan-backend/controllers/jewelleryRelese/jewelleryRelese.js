const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); 
const check = require("../../lib/checkLib"); 


exports.ornamentsDetails = async (req, res, next) => {

    let masterLoanId = req.params.masterLoanId;

}



