const models = require("../../models");
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION

exports.getAllCronList = async (req, res) => {

    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);
    let query = {};
    if (req.query.product) {
        if(req.query.product == 'emi'){
            query.cronType = { [Op.notIn]: ['loan Penal Interest', 'loan Interest'] }
        }
        if(req.query.product == 'loan'){
            query.cronType = { [Op.in]: ['loan Penal Interest', 'loan Interest'] }
        }
    }
    if (req.query.status) {
        query.status = req.query.status;
    }
    if (req.query.cronType) {
        query.cronType = req.query.cronType;
    }
    if (req.query.startDate && req.query.endDate) {
        let start = new Date(req.query.startDate);
        start.setHours(0, 0, 0, 0);
        let end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        query.date = await { [Op.between]: [start, end] }
    }

    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                cronType: { [Op.iLike]: search + '%' },
                status: { [Op.iLike]: search + '%' },
            },
        }]
    };

    let allCronList = await models.cronLogger.findAll({
        where: searchQuery,
        order: [
            ['id', 'desc']
        ],
        offset: offset,
        limit: pageSize,
    });

    let count = await models.cronLogger.findAll({
        where: searchQuery,
    });

    return res.status(200).json({ message: `Fetched all cron successfully`, data: allCronList, count: count.length })


}

