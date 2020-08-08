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
let { mergeInterestTable } = require('../../utils/loanFunction')

//INTEREST TABLE 
exports.getInterestTable = async (req, res, next) => {
    let { loanId, masterLoanId } = req.query;

    let { mergeTble, securedTable, unsecuredTable } = await mergeInterestTable(masterLoanId)

    return res.status(200).json({ data: mergeTble })
}

//INTEREST INFO
exports.getInterestInfo = async (req, res, next) => {
    let { loanId, masterLoanId } = req.query;

    let interestInfo = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        order: [[models.customerLoan, 'id', 'asc']],
        attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
        include: [
            {
                model: models.customerLoan,
                as: 'customerLoan',
                attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                include: [
                    {
                        model: models.scheme,
                        as: 'scheme',
                        attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                    }
                ]
            }
        ]
    })

    return res.status(200).json({ message: "success", data: interestInfo })


}
//CALCULATE PAYABLE AMOUNT
exports.payableAmount = async (req, res, next) => {
    let { masterLoanId } = req.query

    let global = await models.globalSetting.findAll()
    let { gracePeriodDays } = global[0]
    let loan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['id', 'tenure', 'paymentFrequency', 'securedLoanAmount', 'unsecuredLoanAmount', 'isUnsecuredSchemeApplied', 'finalLoanAmount', 'outstandingAmount', 'totalFinalInterestAmt', 'loanStartDate'],
        order: [
            [models.customerLoan, 'id', 'asc'],
            [models.customerLoan, models.customerLoanInterest, 'id', 'asc'],
        ],
        include: [{
            model: models.customerLoan,
            as: 'customerLoan',
            attributes: ['id'],
            include: [
                {
                    model: models.scheme,
                    as: 'scheme',
                    attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                },
                {
                    model: models.customerLoanInterest,
                    as: 'customerLoanInterest',
                    attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                }
            ]
        }]
    })

    let loanId = await loan.customerLoan.map(singleLoan => { return singleLoan.id })

    let securedData = await models.customerLoanInterest.findAll({
        where: {
            loanId: loanId[0],
            emiStatus: { [Op.notIn]: ['paid'] },
        },
        order: [['id', 'asc']],
        attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
    })
    //due emi date
    let dueDateFromDb = securedData[0].emiDueDate
    const dueDate = new Date(dueDateFromDb);
    //current date
    let inDate = moment(moment.utc(moment(new Date())).toDate()).format('YYYY-MM-DD');
    const currentDate = new Date(inDate);

    let daysinYear = 360

    let securedLoanAmount = Number(loan.securedLoanAmount)
    let securedPanelPer = loan.customerLoan[0].scheme.penalInterest

    if (loan.isUnsecuredSchemeApplied) {
        //if unsecured scheme (unsecured loan) applied
        var unsecuredLoanAmount = Number(loan.unsecuredLoanAmount)
        var unsecuredPanelPer = loan.customerLoan[1].scheme.penalInterest
    }
    var lotolPenal = 0;
    if (currentDate > dueDate) {
        //get diff of days
        var diffDays = Math.ceil((Math.abs(dueDate - currentDate)) / (1000 * 60 * 60 * 24));
        if (diffDays > gracePeriodDays) {
            // var securedPanelInterest = Number(((securedLoanAmount * securedPanelPer) / (daysinYear * diffDays)).toFixed(2))
            var securedPanelInterest = Number((((securedLoanAmount * securedPanelPer) / daysinYear) * diffDays).toFixed(2))
            var unsecuredPanelInterest = 0;
            if (loan.isUnsecuredSchemeApplied) {
                //if unsecured scheme (unsecured loan ) applied
                // unsecuredPanelInterest = Number(((unsecuredLoanAmount * unsecuredPanelPer) / (daysinYear * diffDays)).toFixed(2))
                unsecuredPanelInterest = Number((((unsecuredLoanAmount * unsecuredPanelPer) / daysinYear) * diffDays).toFixed(2))
            }
            lotolPenal = Number((securedPanelInterest + unsecuredPanelInterest).toFixed(2))
        }
        // nahi to nahi lagega panel interest
    }

    let paidData = await models.customerLoanInterest.findAll({
        where: {
            loanId: loanId[0],
            emiStatus: { [Op.in]: ['paid'] },
        },
        order: [['id', 'asc']],
        attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
    })
    var lastPaidDate
    if (!check.isEmpty(paidData)) {
        var lastPaidObj = paidData[paidData.length - 1]
        lastPaidDate = new Date(lastPaidObj.emiDueDate);
    } else {
        lastPaidDate = new Date(loan.loanStartDate)
    }

    // let diffForInterest = Math.ceil((Math.abs(currentDate - lastPaidDate)) / (1000 * 60 * 60 * 24))
    let securedInterest = loan.customerLoan[0].customerLoanInterest
    let getEmiInterestData = []

    securedInterest.forEach(element => {
        let data = new Date(element.emiDueDate);
        if (currentDate > data) {
            getEmiInterestData.push(element.balanceAmount)
        }
    });

    if (loan.isUnsecuredSchemeApplied) {
        let unsecuredInterest = loan.customerLoan[1].customerLoanInterest
        unsecuredInterest.forEach(element => {
            let data = new Date(element.emiDueDate);
            if (currentDate > data) {
                getEmiInterestData.push(element.balanceAmount)
            }
        });

    }

    var interestAmount = getEmiInterestData.reduce(function (a, b) {
        return a + b;
    }, 0)


    let totalPayableAmount = (interestAmount + lotolPenal).toFixed(2)

    let data = {
        payableAmount: totalPayableAmount
    }

    return res.status(200).json({ message: 'success', data })


}

//CALCULATE PAYABLE AMOUNT
exports.payableAmountForCustomer = async (req, res, next) => {

    let { masterLoanId } = req.query
}

