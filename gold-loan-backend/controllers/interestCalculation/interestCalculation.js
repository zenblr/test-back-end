const models = require('../../models');
const check = require('../../lib/checkLib');
const sequelize = models.sequelize;
const paginationFUNC = require('../../utils/pagination'); // importing pagination function
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const {calculationData} = require('../../utils/interestCalculation');
const _ = require('lodash');

// add internal branch

exports.calculation = async (req, res) => {
    const { date } = req.body;
    let data = await calculationData();
    return res.status(200).json(data);
}