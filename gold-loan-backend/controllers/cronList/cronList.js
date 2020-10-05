const models = require("../../models");
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION

exports.getAllCronList = async (req, res) => {

    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);
    let query = {};
    // if (req.query.depositStatus) {
    //     query.depositStatus = req.query.depositStatus;
    // }

    // let searchQuery = {
    //     [Op.and]: [query, {
    //         [Op.or]: {
    //             branchName: { [Op.iLike]: search + '%' },
    //             bankName: { [Op.iLike]: search + '%' },
    //             "$masterLoan.customer.first_name$": { [Op.iLike]: search + '%' },
    //             "$masterLoan.customer.last_name$": { [Op.iLike]: search + '%' },
    //             "$masterLoan.customer.customer_unique_id$": { [Op.iLike]: search + '%' },
    //             "$masterLoan.customer.mobile_number$": { [Op.iLike]: search + '%' }
    //         },
    //     }]
    // };

    let allCronList = await models.cronLogger.findAll({
        // where: searchQuery,
        order: [
            ['id', 'desc']
        ],
        offset: offset,
        limit: pageSize,
    });

    let count = await models.cronLogger.findAll({
        // where: searchQuery,
    });

    return res.status(200).json({ message: `Fetched all cron successfully`, data: allCronList, count: count.length })

   
}

