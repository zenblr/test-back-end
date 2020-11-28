const models = require("../../models");
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION
const cron = require('node-cron');

exports.readErrorLogs = async (req, res) => {
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let getAllErrors = await models.errorLogger.findAll({
        order: [
            ['id', 'desc']
        ],
        offset: offset,
        limit: pageSize,
    });

    let count = await models.errorLogger.findAll({});

    return res.status(200).json({ message: `Fetched all error logs successfully`, data: getAllErrors, count: count.length })
}




