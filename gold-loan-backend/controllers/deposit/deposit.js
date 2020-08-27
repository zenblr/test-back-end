const models = require("../../models");
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION

exports.getAllDeposits = async (req, res) => {

    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);
    let query = {};
    if (req.query.depositStatus) {
        query.depositStatus = req.query.depositStatus;
    }

    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                branchName: { [Op.iLike]: search + '%' },
                bankName: { [Op.iLike]: search + '%' },
                "$masterLoan.customer.first_name$": { [Op.iLike]: search + '%' },
                "$masterLoan.customer.last_name$": { [Op.iLike]: search + '%' },
                "$masterLoan.customer.customer_unique_id$": { [Op.iLike]: search + '%' },
                "$masterLoan.customer.mobile_number$": { [Op.iLike]: search + '%' }
            },
        }]
    };

    let associateModel = [
        {
            model: models.customerLoanMaster,
            as: 'masterLoan',
            attributes: ['id'],
            include: [
                {
                    model: models.customer,
                    as: 'customer',
                    where: { isActive: true },
                    attributes: ['id', 'customerUniqueId', 'firstName', 'lastName', 'mobileNumber']
                }, {
                    model: models.customerLoan,
                    as: 'customerLoan'
                }]
        },
    ]

    let allDeposits = await models.customerLoanTransaction.findAll({
        where: searchQuery,
        include: associateModel,
        order: [
            ['id', 'desc'],
            // [{ model: models.customerLoanMaster, as: 'masterLoan' }, 'id', 'asc']
        ],
        offset: offset,
        limit: pageSize,
    });

    let count = await models.customerLoanTransaction.findAll({
        where: searchQuery,
        include: associateModel,
    });

    if (allDeposits.length === 0) {
        return res.status(200).json({ data: [] })
    } else {
        return res.status(200).json({ message: `Fetched all deposits successfully`, data: allDeposits, count: count.length })
    }
}

exports.updateDepositStatus = async (req, res) => {
    let Id = req.params.id;
    let modifiedBy = req.userData.id;
    console.log(req.body)
    const { Status } = req.body;
    let updatedStatus = await models.customerLoanTransaction.update({ depositStatus: Status, modifiedBy }, { where: { id: Id } });
    if (updatedStatus.length === 0) {
        return res.status(400).json({ message: 'Deposit Status doesn\'t updated! ' });
    } else {
        return res.status(200).json({ message: 'Deposit Status updated! ' });
    }

}