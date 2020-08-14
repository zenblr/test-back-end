const models = require('../../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../../utils/pagination'); // IMPORTING PAGINATION FUNCTION

const check = require("../../../lib/checkLib"); // IMPORTING CHECKLIB 
const moment = require('moment');

exports.addDeduction = async (req, res, next) => {
    let { standardDeduction } = req.body;

    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let deductionExist = await models.standardDeduction.findOne({ where: { standardDeduction, isActive: true } });

    if (!check.isEmpty(deductionExist)) {
        return res.status(400).json({ message: `Standard deduction already exist` })
    }

    const deduction = await models.standardDeduction.create(
        { standardDeduction, createdBy, modifiedBy, isActive: true },
    );
    if (deduction) {
        return res.status(200).json({ message: `Standard deduction created` });
    } else {
        return res.status(404).json({ message: `Data not found` });
    }

}


exports.readDeductionDetails = async (req, res, next) => {
    const { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);
    const searchQuery = {
        isActive: true,
        [Op.or]: {
            standardDeduction: sequelize.where(
                sequelize.cast(sequelize.col("standardDeduction.standard_deduction"), "varchar"),
                {
                    [Op.iLike]: search + "%"
                },
            ),
        },
    }

    let deductionDetails = await models.standardDeduction.findAll({
        where: searchQuery,
        order: [["standardDeduction", "ASC"]],
        offset: offset,
        limit: pageSize,
    });
    let count = await models.standardDeduction.findAll({
        where: searchQuery
    });

    if (deductionDetails.length === 0) {
        res.status(200).json({
            data: [],
            count: 0
        });
    } else {
        res.status(200).json({
            data: deductionDetails,
            count: count.length
        });
    }
}

exports.readAllDeductionDetails = async (req, res, next) => {

    let deductionDetails = await models.standardDeduction.findAll({ where: { isActive: true }, order: [["standardDeduction", "ASC"]], },);

    if (!deductionDetails) {
        return res.status(404).json({ message: 'Data not found' });
    } else {
        return res.status(200).json({ deductionDetails });
    }
}

exports.getByDeductionId = async (req, res, next) => {

    const deductionId = req.params.id;
    let detail = await models.standardDeduction.findOne({ where: { id: deductionId, isActive: true } });

    if (!detail) {
        return res.status(404).json({ message: 'Data not found' });
    } else {
        return res.status(200).json({ standardDeduction: detail });
    }

}

exports.updateDeduction = async (req, res, next) => {
    const deductionId = req.params.id;
    const standardDeduction = req.body.standardDeduction;
    let modifiedBy = req.userData.id;

    const result = await models.standardDeduction.update({ standardDeduction, modifiedBy }, { where: { id: deductionId } })

    if (result[0] === 0) {
        return res.status(404).json({ message: 'Data not found' });
    } else {
        return res.status(200).json({ message: 'Success' });
    }
}

exports.deleteDeduction = async (req, res, next) => {
    const id = req.params.id;
    let modifiedBy = req.userData.id;
    const deduction = await models.standardDeduction.update({ isActive: false, modifiedBy }, { where: { id: id } })

    if (deduction[0] == 0) {
        return res.status(404).json({ message: "Data not found" });
    }
    return res.status(200).json({ message: 'Success' });

}
