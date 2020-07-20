const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination');
const check = require("../../lib/checkLib");


exports.ornamentsDetails = async (req, res, next) => {

    let masterLoanId = req.params.masterLoanId;

    let customerLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes:['customerId','masterLoanUniqueId','finalLoanAmount','tenure','loanStartDate','loanEndDate'],
        include: [
            {
                model: models.customerLoan,
                as: 'customerLoan',
                attributes:['masterLoanId','loanUniqueId','loanAmount']
            },
            {
                model: models.customerLoanPersonalDetail,
                as: 'loanPersonalDetail',
                attributes:['customerUniqueId']
            },  {
                model: models.customerLoanOrnamentsDetail,
                as: 'loanOrnamentsDetail',
                include: [
                    {
                        model: models.ornamentType,
                        as: "ornamentType"
                    }
                ]
            }, {
                model: models.customerLoanPackageDetails,
                as: 'loanPacketDetails',
                include: [{
                    model: models.packet,
                    include: [{
                        model: models.ornamentType
                    }]
                }]
            }, ]
    });

    let ornamentType = [];
    if (customerLoan.loanOrnamentsDetail.length != 0) {
        for (let ornamentsDetail of customerLoan.loanOrnamentsDetail) {
            ornamentType.push({ ornamentType: ornamentsDetail.ornamentType, id: ornamentsDetail.id })
        }
        customerLoan.dataValues.ornamentType = ornamentType;
    }
    if (customerLoan.unsecuredLoan == null) {
        customerLoan.dataValues['isUnsecuredSchemeApplied'] = false;
    } else {
        if (customerLoan.unsecuredLoan.isActive) {
            customerLoan.dataValues['isUnsecuredSchemeApplied'] = true
        } else {
            customerLoan.dataValues['isUnsecuredSchemeApplied'] = customerLoan.unsecuredLoan.isActive
        }
    }
    let lastPayment = await getLoanLastPayment(masterLoanId);
    return res.status(200).json({ message: 'success', customerLoan, lastPayment })
}

async function getLoanLastPayment(masterLoanId) {

    let lastPayment = await models.customerLoanInterest.findOne({
        where: { masterLoanId: masterLoanId, emiStatus: "complete" },
        order: [["updatedAt", "DESC"]],
    });
    return lastPayment;
}


