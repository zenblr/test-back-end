const models = require("../../models");
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const { createReferenceCode } = require("../../utils/referenceCode");

const request = require("request");
const moment = require("moment");
const CONSTANT = require("../../utils/constant");

const check = require("../../lib/checkLib");
const { paginationWithFromTo } = require("../../utils/pagination");
let sms = require('../../utils/sendSMS');

exports.getInterestTable = async (req, res, next) => {
    let { loanId, masterLoanId } = req.query;

    let interestTable = await models.customerLoan.findOne({
        where: { id: loanId },
        include: [{
            model: models.customerLoanInterest,
            as: 'customerLoanInterest'
        }]
    })

    return res.staus(200).json({ message: "success", data: interestTable })

}


exports.getInterestInfo = async (req, res, next) => {
    let { loanId, masterLoanId } = req.query;

    let interestInfo = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        order: [[models.customerLoan, 'id', 'asc']],
        include: [
            {
                model: models.customerLoan,
                as: 'customerLoan',
                include: [
                    {
                        model: models.scheme,
                        as: 'scheme'
                    }
                ]
            }
        ]
    })

    return res.status(200).json({ message: "success", data: interestInfo })


}