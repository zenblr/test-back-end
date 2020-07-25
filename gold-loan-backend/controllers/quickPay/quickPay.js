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
        order: [
            [models.customerLoan, 'id', 'asc'],
            [models.customerLoan, models.customerLoanInterest, 'id', 'asc'],
        ],
        include: [{
            model: models.customerLoan,
            as: 'customerLoan',
            attributes: ['id'],
            include: [{
                model: models.customerLoanInterest,
                as: 'customerLoanInterest',
                attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
            }]
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

    let dueDateFromDb = securedData[0].emiDueDate
    const dueDate = new Date(dueDateFromDb);

    let inDate = moment(moment.utc(moment(new Date())).toDate()).format('YYYY-MM-DD');
    const currentDate = new Date(inDate);

    if (currentDate > dueDate){
        const diffDays = Math.ceil((Math.abs(dueDate - currentDate)) / (1000 * 60 * 60 * 24));
        if(diffDays > gracePeriodDays){
            console.log(diffDays)
            //panel interest lagega
        }
        // nahi to nahi lagega panel interest
    }else{
        //panel interest nahi lagega
        console.log('false')
    }
   

    console.log(dueDateFromDb, inDate, gracePeriodDays)

    return res.status(200).json({ message: 'success', securedData, data: loanId })


}
