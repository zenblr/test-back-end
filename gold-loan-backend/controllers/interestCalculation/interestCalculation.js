const models = require('../../models');
const check = require('../../lib/checkLib');
const sequelize = models.sequelize;
const paginationFUNC = require('../../utils/pagination'); // importing pagination function
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const {dailyIntrestCalculation} = require('../../utils/interestCalculation');
const _ = require('lodash');
const moment = require("moment");

// add internal branch

exports.calculation = async (req, res) => {
    let data;
    let { date } = req.body;
    if(date){
        data = await dailyIntrestCalculation(date);
    }else{
        date = moment();
        data = await dailyIntrestCalculation(date);
    }
    return res.status(200).json(data);
}