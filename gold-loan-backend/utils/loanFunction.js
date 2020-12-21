const models = require('../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require("../lib/checkLib");
const moment = require("moment");
const _ = require('lodash');

let getGlobalSetting = async () => {
    let globalSettings = await models.globalSetting.getGlobalSetting();
    return globalSettings;
}

let getCustomerInterestAmount = async (masterLoanId) => {
    let loanData = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        include: [{
            model: models.customerLoan,
            as: 'customerLoan',
            attributes: ['id', 'loanType'],
            where: { isActive: true }
        }]
    });
    let loan = {}
    await loanData.customerLoan.map((data) => {
        if (data.loanType == "secured") {
            loan.secured = data.id;
        } else {
            loan.unsecured = data.id
        }
    });
    let amount = {};
    if (loan.secured) {
        amount.secured = await interestAmountCalculation(loan.secured);
    }
    if (loan.unsecured) {
        amount.unsecured = await interestAmountCalculation(loan.unsecured);
    }
    return amount
}

let payableAmountForLoan = async (amount, loan) => {
    let securedPenalInterest = amount.secured.penalInterest
    let securedInterest = amount.secured.interest
    let interest = amount.secured.interest
    let penalInterest = amount.secured.penalInterest

    let unsecuredInterest = 0
    let unsecuredPenalInterest = 0
    let payableAmount = Number(amount.secured.interest) + Number(amount.secured.penalInterest)
    if (amount.unsecured) {
        payableAmount = Number(payableAmount) + Number(amount.unsecured.interest) + Number(amount.unsecured.penalInterest)
        interest = Number(interest) + Number(amount.unsecured.interest)
        penalInterest = Number(penalInterest) + Number(amount.unsecured.penalInterest)
        unsecuredInterest = Number(amount.unsecured.interest)
        unsecuredPenalInterest = Number(amount.unsecured.penalInterest)
    }
    let data = {}
    data.securedOutstandingAmount = loan.customerLoan[0].outstandingAmount
    if (loan.customerLoan.length > 1) {
        data.unsecuredOutstandingAmount = loan.customerLoan[1].outstandingAmount
    }
    data.securedPenalInterest = securedPenalInterest
    data.unsecuredPenalInterest = unsecuredPenalInterest
    data.securedInterest = Number((securedInterest).toFixed(2))
    data.unsecuredInterest = Number((unsecuredInterest).toFixed(2))
    data.interest = Number((interest).toFixed(2))
    data.penalInterest = Number((penalInterest).toFixed(2))
    data.payableAmount = Number((payableAmount).toFixed(2))

    return data
}

let interestAmountCalculation = async (id) => {
    let amount = {
        interest: 0,
        penalInterest: 0
    }
    let interest = await models.customerLoanInterest.findAll({ where: { emiStatus: { [Op.notIn]: ["paid"] }, loanId: id }, attributes: ['interestAccrual', 'penalOutstanding'] });
    let interestAmount = await interest.map((data) => Number(data.interestAccrual));
    let penalInterest = await interest.map((data) => Number(data.penalOutstanding));
    amount.interest = Number((_.sum(interestAmount)).toFixed(2));
    amount.penalInterest = Number((_.sum(penalInterest)).toFixed(2));
    return amount
}

let getLoanDetails = async (masterLoanId) => {
    let loanData = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        order: [
            [models.customerLoan, 'id', 'asc']
        ],
        include: [
            {
                model: models.customerLoan,
                as: 'customerLoan',
                where: { isActive: true },
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
    return loanData;
}

let getSchemeDetails = async (schemeId) => {
    let loanData = await models.scheme.findOne({
        where: { id: schemeId },
        include: [{
            model: models.schemeInterest,
            as: 'schemeInterest'
        }]
    })
    return loanData;
}

let getCustomerLoanDetails = async (loanId) => {
    let loanData = await models.customerLoan.findOne({
        where: { id: loanId }
    })
    return loanData;
}

let getAllCustomerLoanId = async () => {
    let stageId = await models.loanStage.findOne({ where: { name: 'disbursed' } })
    let masterLona = await models.customerLoanMaster.findAll({
        order: [
            [models.customerLoan, 'id', 'asc']
        ],
        where: {
            isActive: true,
            // loanStageId: stageId.id,
            isLoanCompleted: true,
            "$partRelease$": null,
            "$fullRelease$": null
        },
        attributes: ['id'],
        include: [
            {
                model: models.partRelease,
                as: 'partRelease',
                attributes: ['amountStatus']
            }, {
                model: models.customerLoan,
                as: 'customerLoan',
                attributes: ['id']
            }, {
                model: models.fullRelease,
                as: 'fullRelease',
                attributes: ['amountStatus', 'fullReleaseStatus']
            }],
    });
    let customerLoanId = [];
    for (const masterLoanData of masterLona) {
        await masterLoanData.customerLoan.map((data) => { customerLoanId.push(data.id) });
    }
    return customerLoanId
}

let getAllOrnamentReleasedCustomerLoanId = async () => {
    let masterLona = await models.customerLoanMaster.findAll({
        order: [
            [models.customerLoan, 'id', 'asc']
        ],
        where: {
            isActive: true,
            isLoanCompleted: true,
            isOrnamentsReleased : true
        },
        attributes: ['id'],
        include: [{
                model: models.customerLoan,
                as: 'customerLoan',
                attributes: ['id']
            }],
    });
    let customerLoanId = [];
    for (const masterLoanData of masterLona) {
        await masterLoanData.customerLoan.map((data) => { customerLoanId.push(data.id) });
    }
    return customerLoanId
}

let calculationDataForReleasedLoan = async () => {
    let customerLoanId = await getAllOrnamentReleasedCustomerLoanId();
    let loanInfo = [];
    for (const id of customerLoanId) {
        let info = await getAllDetailsOfCustomerLoan(id);
        loanInfo.push(info);
    }
    let noOfDaysInYear = 360
    let global = await models.globalSetting.findAll()
    let { gracePeriodDays } = global[0]
    return { noOfDaysInYear, gracePeriodDays, loanInfo };
}

let getAllDetailsOfCustomerLoan = async (customerLoanId) => {
    let loanData = await models.customerLoan.findOne({
        where: { id: customerLoanId },
        order: [
            ['id', 'asc'],
            [models.customerLoanInterest, 'id', 'asc'],
        ],
        attributes: ['id', 'masterLoanId', 'loanUniqueId', 'selectedSlab', 'loanAmount', 'outstandingAmount', 'currentSlab', 'currentInterestRate', 'penalInterestLastReceivedDate', 'penalInterest', 'loanType', 'rebateInterestRate', 'schemeId'],
        include: [{
            model: models.customerLoanSlabRate,
            as: 'slab',
            attributes: ['days', 'interestRate']
        }, {
            model: models.customerLoanMaster,
            as: 'masterLoan',
            attributes: ['tenure', 'loanStartDate', 'loanEndDate', 'processingCharge', 'totalFinalInterestAmt', 'outstandingAmount']
        }, {
            model: models.customerLoanInterest,
            as: 'customerLoanInterest',
            attributes: { exclude: ['createdAt', 'createdBy', 'modifiedBy', 'updatedAt'] },
        }, {
            model: models.scheme,
            as: 'scheme',
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        }]
    })
    return loanData;
}

let getInterestTableOfSingleLoan = async (customerLoanId) => {
    let data = await models.customerLoanInterest.findAll({
        where: {
            loanId: customerLoanId,
            isExtraDaysInterest: false,
            emiStatus: { [Op.notIn]: ['paid'] },
        },
        order: [['id', 'asc']],
        attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
    })
    return data
}

let calculationData = async () => {
    let customerLoanId = await getAllCustomerLoanId();
    let loanInfo = [];
    for (const id of customerLoanId) {
        let info = await getAllDetailsOfCustomerLoan(id);
        loanInfo.push(info);
    }
    let noOfDaysInYear = 360
    let global = await models.globalSetting.findAll()
    let { gracePeriodDays } = global[0]
    return { noOfDaysInYear, gracePeriodDays, loanInfo };
}

let checkPaidInterest = async (loanId, masterLaonId) => {
    let checkDailyAmount = await models.customerLoanInterest.findOne({
        where: { loanId: loanId, masterLoanId: masterLaonId, emiStatus: 'paid', isExtraDaysInterest: false },
        order: [['emiDueDate', 'DESC']]
    })
    return checkDailyAmount
}

let getInterestOfSelectedMonth = async (loanId, currentMonth, currentYear) => {
    let getMonthInterest = await models.customerLoanInterest.findAll({
        where: {
            [Op.and]: [
                sequelize.where(sequelize.fn("date_part", 'MONTH', sequelize.col('emi_due_date')), currentMonth),
                sequelize.where(sequelize.fn("date_part", 'YEAR', sequelize.col('emi_due_date')), currentYear),
                { loanId: loanId }
            ]
        },
        order: [['emiDueDate', 'ASC']]
    })

    return getMonthInterest
}

let getFirstInterest = async (loanId, masterLaonId) => {
    let firstInterest = await models.customerLoanInterest.findOne({
        where: { loanId: loanId, masterLoanId: masterLaonId, isExtraDaysInterest: false },
        order: [['emiDueDate', 'ASC']]
    })
    return firstInterest
}

let calculation = async (noOfDays, interestRate, loanAmount, paidAmount) => {
    let oneDayInterest = interestRate / 30;
    let oneDayAmount = loanAmount * (oneDayInterest / 100);
    let amount = oneDayAmount * noOfDays;
    let totalAmount = (Math.round(amount * 100) / 100) - paidAmount;
    if (totalAmount < 0) {
        return 0
    } else {
        return totalAmount;
    }
}

let newSlabRateInterestCalcultaion = async (loanAmount, interestRate, paymentFrequency, tenure) => {
    let amount = ((Number(loanAmount) * (Number(interestRate) * 12 / 100)) * Number(paymentFrequency)
        / 360).toFixed(2);
    let length = (tenure * 30) / paymentFrequency;
    if (amount < 0) {
        amount = 0
    }
    return { amount, length }
}

let getStepUpslab = async (loanId, noOfDys) => {
    let stepUpSlab = await models.customerLoanSlabRate.findOne({
        where: { loanId: loanId, days: { [Op.gte]: noOfDys } },
        attributes: ['days', 'interestRate'],
        order: [['days', 'ASC']]
    });
    if (!stepUpSlab) {
        stepUpSlab = await models.customerLoanSlabRate.findOne({
            where: { loanId: loanId },
            attributes: ['days', 'interestRate'],
            order: [['days', 'DESC']]
        });
        return stepUpSlab;
    } else {
        return stepUpSlab;
    }
}

let getLastInterest = async (loanId, masterLaonId) => {
    let lastInterest = await models.customerLoanInterest.findOne({
        where: { loanId: loanId, masterLoanId: masterLaonId, isExtraDaysInterest: false },
        order: [['emiDueDate', 'DESC']],
        attributes: ['id', 'paidAmount', 'highestInterestAmount', 'rebateAmount', 'interestAmount']
    });
    return lastInterest;
}

let getAllNotPaidInterest = async (loanId) => {
    let allNotPaidInterest = await models.customerLoanInterest.findAll({
        where: { loanId: loanId, emiStatus: { [Op.notIn]: ['paid'] }, isExtraDaysInterest: false },
        attributes: ['id', 'interestAmount', 'paidAmount', 'emiDueDate', 'highestInterestAmount', 'rebateAmount']
    });
    return allNotPaidInterest;
}

let getAllInterest = async (loanId) => {
    let allNotPaidInterest = await models.customerLoanInterest.findAll({
        where: { loanId: loanId, isExtraDaysInterest: false },
        attributes: ['id', 'interestAmount', 'paidAmount', 'emiDueDate', 'highestInterestAmount', 'rebateAmount']
    });
    return allNotPaidInterest;
}

let getAllPaidInterestForCalculation = async (loanId) => {
    let allPaidInterest = await models.customerLoanInterest.findAll({
        where: { loanId: loanId, emiStatus: 'paid' }
    });
    return allPaidInterest;
}

let getAllPaidPartialyPaidInterest = async (loanId) => {
    let allpaidPartialyPaidInterest = await models.customerLoanInterest.findAll({
        where: { loanId: loanId,  emiStatus: { [Op.in]: ['paid','partially paid'] } }
    });
    return allpaidPartialyPaidInterest;
}

let getAllInterestLessThanDate = async (loanId, date) => {
    let allInterestLessThanDate = await models.customerLoanInterest.findAll({
        where: { loanId: loanId, emiDueDate: { [Op.lte]: date, }, emiStatus: { [Op.notIn]: ['paid'] }, isExtraDaysInterest: false },
        attributes: ['id', 'interestAmount', 'paidAmount', 'emiDueDate', 'highestInterestAmount', 'rebateAmount']
    });
    return allInterestLessThanDate;
}


let getAllInterestGreaterThanDate = async (loanId, date) => {
    let allInterestGreaterThanDate = await models.customerLoanInterest.findAll({
        where: { loanId: loanId, emiDueDate: { [Op.gt]: date, }, emiStatus: { [Op.notIn]: ['paid'] }, isExtraDaysInterest: false },
        attributes: ['id', 'interestAmount', 'paidAmount', 'emiDueDate']
    });
    return allInterestGreaterThanDate;
}

let getPendingNoOfDaysInterest = async (loanId, date) => {
    let pendingNoOfDaysInterest = await models.customerLoanInterest.findOne({
        where: { loanId: loanId, emiDueDate: { [Op.gt]: date, }, emiStatus: { [Op.notIn]: ['paid'] }, isExtraDaysInterest: false },
        attributes: ['id', 'paidAmount', 'emiDueDate'],
        order: [['emiDueDate', 'ASC']]
    });
    return pendingNoOfDaysInterest;
}

let getExtraInterest = async (loanId) => {
    let extraInteres = await models.customerLoanInterest.findOne({
        where: { loanId: loanId, isExtraDaysInterest: true }
    });
    return extraInteres;
}

let mergeInterestTable = async (masterLoanId) => {

    let interestTable = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['id', 'isUnsecuredSchemeApplied'],
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
                where: { isExtraDaysInterest: false },
                as: 'customerLoanInterest',
                attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
            }]
        }]
    })
    let securedTable = interestTable.customerLoan[0].customerLoanInterest
    let unsecuredTable
    if (interestTable.isUnsecuredSchemeApplied) {
        unsecuredTable = interestTable.customerLoan[1].customerLoanInterest
    }

    let mergeTble = []

    for (let i = 0; i < securedTable.length; i++) {
        let data = {}
        data.masterLoanId = securedTable[i].masterLoanId
        data.emiDueDate = securedTable[i].emiDueDate
        data.emiStatus = securedTable[i].emiStatus

        if (interestTable.isUnsecuredSchemeApplied) {
            data.emiReceivedDate = securedTable[i].emiReceivedDate
            data.interestAmount = (Number(securedTable[i].interestAmount) + Number(unsecuredTable[i].interestAmount)).toFixed(2)
            data.balanceAmount = (Number(securedTable[i].outstandingInterest) + Number(unsecuredTable[i].outstandingInterest)).toFixed(2)
            data.paidAmount = (Number(securedTable[i].paidAmount) + Number(unsecuredTable[i].paidAmount)).toFixed(2)
            data.penalInterest = (Number(securedTable[i].penalInterest) + Number(unsecuredTable[i].penalInterest)).toFixed(2)
            data.penalPaid = (Number(securedTable[i].penalPaid) + Number(unsecuredTable[i].penalPaid)).toFixed(2)
            data.rebateAmount = (Number(securedTable[i].rebateAmount) + Number(unsecuredTable[i].rebateAmount)).toFixed(2)
            if (securedTable[i].emiStatus == 'partially paid' || unsecuredTable[i].emiStatus == 'partially paid') {
                data.emiStatus = 'partially paid'
            } else if (securedTable[i].emiStatus == 'pending' || unsecuredTable[i].emiStatus == 'pending') {
                data.emiStatus = 'pending'
            }
        } else {
            data.emiReceivedDate = securedTable[i].emiReceivedDate
            data.interestAmount = (Number(securedTable[i].interestAmount)).toFixed(2)
            data.balanceAmount = (Number(securedTable[i].outstandingInterest)).toFixed(2)
            data.paidAmount = (Number(securedTable[i].paidAmount)).toFixed(2)
            data.penalInterest = securedTable[i].penalInterest
            data.penalPaid = securedTable[i].penalPaid
            data.rebateAmount = (securedTable[i].rebateAmount)
        }
        mergeTble.push(data)
    };

    return { mergeTble, securedTable, unsecuredTable };
}


//Selected loan
let getCustomerLoanId = async (masterLoanId) => {
    let masterLona = await models.customerLoanMaster.findAll({
        order: [
            [models.customerLoan, 'id', 'asc']
        ],
        where: {
            isActive: true,
            id: masterLoanId
        },
        attributes: ['id'],
        include: [{
            model: models.customerLoan,
            as: 'customerLoan',
            attributes: ['id']
        }],
    });
    let customerLoanId = [];
    for (const masterLoanData of masterLona) {
        await masterLoanData.customerLoan.map((data) => { customerLoanId.push(data.id) });
    }
    return customerLoanId
}

let calculationDataOneLoan = async (masterLoanId) => {
    let customerLoanId = await getCustomerLoanId(masterLoanId);
    console.log(customerLoanId)
    let loanInfo = [];
    for (const id of customerLoanId) {
        let info = await getAllDetailsOfCustomerLoan(id);
        loanInfo.push(info);
    }
    let noOfDaysInYear = 360
    let global = await models.globalSetting.findAll()
    let { gracePeriodDays } = global[0]
    return { noOfDaysInYear, gracePeriodDays, loanInfo };
}

let intrestCalculationForSelectedLoan = async (date, masterLoanId) => {
    //for rebate
    //If rebate is not added
    let rebateData = await calculationDataOneLoan(masterLoanId);
    let loanInfoRebate = rebateData.loanInfo;
    await sequelize.transaction(async t => {
        for (const loan of loanInfoRebate) {
            if (!loan.rebateInterestRate) {
                let scheme = await models.scheme.findOne({
                    where: { id: loan.schemeId },
                    attributes: ['schemeName'],
                    order: [[models.schemeInterest, 'id', 'desc']],
                    include: [{
                        model: models.schemeInterest,
                        as: 'schemeInterest'
                    }]
                })
                if(scheme){
                    let rebateInterestRate = scheme.schemeInterest[0].interestRate;
                await models.customerLoan.update({rebateInterestRate},{ where: { id: loan.id }, transaction: t });
                let allInterest = await getAllInterest(loan.id);
                let interest = await newSlabRateInterestCalcultaion(loan.outstandingAmount, rebateInterestRate, loan.selectedSlab, loan.masterLoan.tenure);
                //update rebate and rebateInterestAmount 3 60
                for (const interestData of allInterest) {
                    let highestInterestAmount = interest.amount;
                    let rebateAmount = highestInterestAmount - interestData.interestAmount;
                    await models.customerLoanInterest.update({ rebateInterestRate:rebateInterestRate,highestInterestAmount,rebateAmount }, { where: { id: interestData.id }, transaction: t });
                }
                //update last interest if changed
                if (!Number.isInteger(interest.length)) {
                    const noOfMonths = (((loan.masterLoan.tenure * 30) - ((allInterest.length - 1) * loan.selectedSlab)) / 30)
                    let oneMonthAmount = interest.amount / (loan.selectedSlab / 30);
                    let highestInterestAmount = (oneMonthAmount * noOfMonths).toFixed(2);
                    let lastInterest = await getLastInterest(loan.id, loan.masterLoanId)
                    let rebateAmount = highestInterestAmount - lastInterest.interestAmount;
                    await models.customerLoanInterest.update({ rebateAmount,highestInterestAmount,rebateInterestRate }, { where: { id: lastInterest.id}, transaction: t });
                }
                }
            }
        }
    })
    ///
    let data = await calculationDataOneLoan(masterLoanId);
    let loanInfo = data.loanInfo;
    let currentDate = moment();
    let noOfDays = 0;
    await sequelize.transaction(async t => {
        for (const loan of loanInfo) {
            let allInterestTable = await getAllInterest(loan.id);
            let lastPaidEmi = await checkPaidInterest(loan.id, loan.masterLoanId);
            let firstInterestToPay = await getFirstInterestToPay(loan.id, loan.masterLoanId);
            let loanStartDate;
            if (!lastPaidEmi) {
                loanStartDate = moment(loan.masterLoan.loanStartDate);
                noOfDays = currentDate.diff(loanStartDate, 'days');
            } else {
                loanStartDate = moment(lastPaidEmi.emiDueDate);
                noOfDays = currentDate.diff(loanStartDate, 'days');
            }
            if (firstInterestToPay) {
                var checkDueDateForSlab = moment(date).isAfter(firstInterestToPay.emiDueDate);//check due date to change slab
            }
            noOfDays += 1;
            if (noOfDays > loan.currentSlab && checkDueDateForSlab) {
                //scenario 2 slab changed
                let stepUpSlab = await getStepUpslab(loan.id, noOfDays);
                let interest = await newSlabRateInterestCalcultaion(loan.outstandingAmount, stepUpSlab.interestRate, loan.selectedSlab, loan.masterLoan.tenure);
                let allInterest = await getAllNotPaidInterest(loan.id)//get all interest
                let interestLessThanDate = await getAllInterestLessThanDate(loan.id, date);
                let interestGreaterThanDate = await getAllInterestGreaterThanDate(loan.id, date);
                //update interestAccrual & interest amount //here to debit amount
                for (const interestData of interestLessThanDate) {
                    let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, credit: 0.00, isPenalInterest: false } });
                    if (checkDebitEntry.length == 0) {
                        let rebateAmount = interestData.highestInterestAmount - interest.amount;
                        let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: interest.amount, description: `Net interest due (after rebate) ${moment(interestData.emiDueDate).format('DD/MM/YYYY')}`, paymentDate: moment(),rebateAmount:rebateAmount }, { transaction: t });
                        await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                    } else {
                        let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                        let totalDebitedAmount = _.sum(debitedAmount);
                        let newDebitAmount = interest.amount - totalDebitedAmount;
                        if (newDebitAmount > 0) {
                            let rebateAmount = -Math.abs(newDebitAmount)
                            let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: newDebitAmount, description: `stepUpInterest ${moment(interestData.emiDueDate).format('DD/MM/YYYY')}`, paymentDate: moment(),rebateAmount }, { transaction: t });
                            await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                        } else if (newDebitAmount < 0) {
                            let rebateAmount = Math.abs(newDebitAmount)
                            let credit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, credit: Math.abs(newDebitAmount), description: `stepDownInterest ${moment(interestData.emiDueDate).format('DD/MM/YYYY')}`, paymentDate: moment(),rebateAmount }, { transaction: t });
                            await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${credit.id}` }, { where: { id: credit.id }, transaction: t });
                        }
                    }
                    let outstandingInterest = interest.amount - interestData.paidAmount;
                    let interestAccrual = interest.amount - interestData.paidAmount;
                    await models.customerLoanInterest.update({ interestAmount: interest.amount, totalInterestAccrual: interest.amount, outstandingInterest, interestAccrual, interestRate: stepUpSlab.interestRate }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                }

                if (allInterest.length != interestLessThanDate.length) {
                    let pendingNoOfDays = noOfDays - (interestLessThanDate.length * loan.selectedSlab);
                    if (pendingNoOfDays > 0) {
                        let oneDayInterest = stepUpSlab.interestRate / 30;
                        let oneDayAmount = loan.outstandingAmount * (oneDayInterest / 100);
                        let pendingDaysAmount = pendingNoOfDays * oneDayAmount;
                        let nextInterest = await getPendingNoOfDaysInterest(loan.id, date);
                        if (nextInterest) {
                            let amount
                            if (pendingDaysAmount > Number(nextInterest.paidAmount)) {
                                amount = pendingDaysAmount - nextInterest.paidAmount;

                                await models.customerLoanInterest.update({ interestAccrual: amount, totalInterestAccrual: pendingDaysAmount, interestRate: stepUpSlab.interestRate, outstandingInterest: amount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                            } else {
                                amount = nextInterest.paidAmount - pendingDaysAmount;

                                await models.customerLoanInterest.update({ interestAccrual: 0.00, totalInterestAccrual: pendingDaysAmount, interestRate: stepUpSlab.interestRate, outstandingInterest: amount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                            }
                        }
                    }
                }
                //calculate extra interest
                if (interestGreaterThanDate.length == 0) {
                    let pendingNoOfDays = noOfDays - (interestLessThanDate.length * loan.selectedSlab);
                    if (pendingNoOfDays > 0) {
                        let oneDayInterest = stepUpSlab.interestRate / 30;
                        let oneDayAmount = loan.outstandingAmount * (oneDayInterest / 100);
                        let pendingDaysAmount = pendingNoOfDays * oneDayAmount;
                        let extraInterest = await getExtraInterest(loan.id);
                        //rebate
                        let oneDayInterestRebate = loan.rebateInterestRate / 30;
                        let oneDayAmountRebate = loan.outstandingAmount * (oneDayInterestRebate / 100);
                        let highestInterestAmount = pendingNoOfDays * oneDayAmountRebate;
                        let rebateAmount = highestInterestAmount - pendingDaysAmount;
                        //
                        if (!extraInterest) {
                            let amount = pendingDaysAmount;
                            await models.customerLoanInterest.create({ loanId: loan.id, masterLoanId: loan.masterLoanId, emiStartDate: date, emiDueDate: date, emiEndDate: date, interestRate: stepUpSlab.interestRate, interestAmount: amount, interestAccrual: amount, totalInterestAccrual: amount, outstandingInterest: amount, isExtraDaysInterest: true, rebateAmount,highestInterestAmount,rebateInterestRate:loan.rebateInterestRate  }, { transaction: t });
                        } else {
                            let amount = pendingDaysAmount;
                            let interestAccrual = amount - extraInterest.paidAmount;
                            let outstandingInterest = amount - extraInterest.paidAmount;
                            if (amount > Number(extraInterest.paidAmount)) {
                                interestAccrual = amount - extraInterest.paidAmount;
                                outstandingInterest = amount - extraInterest.paidAmount;
                            } else {
                                interestAccrual = extraInterest.paidAmount - amount;
                                outstandingInterest = extraInterest.paidAmount - amount;
                            }
                            await models.customerLoanInterest.update({ interestAmount: amount, emiDueDate: date, emiEndDate: date, interestAccrual, totalInterestAccrual: amount, outstandingInterest, interestRate: stepUpSlab.interestRate, rebateAmount,highestInterestAmount,rebateInterestRate:loan.rebateInterestRate }, { where: { id: extraInterest.id }, transaction: t });
                        }
                    }
                }
                //update all interest amount
                for (const interestData of allInterest) {
                    let outstandingInterest = interest.amount - interestData.paidAmount;
                    let rebateAmount = interestData.highestInterestAmount - interest.amount;
                    if(outstandingInterest >= 0){
                        await models.customerLoanInterest.update({ interestAmount: interest.amount, outstandingInterest, interestRate: stepUpSlab.interestRate,rebateAmount }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                    }else{
                        await models.customerLoanInterest.update({ interestAmount: interest.amount, outstandingInterest : 0.00, interestRate: stepUpSlab.interestRate,rebateAmount }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                    }
                }
                //update last interest if changed
                if (!Number.isInteger(interest.length)) {
                    const noOfMonths = (((loan.masterLoan.tenure * 30) - ((allInterestTable.length - 1) * loan.selectedSlab)) / 30)
                    let oneMonthAmount = interest.amount / (loan.selectedSlab / 30);
                    let amount = (oneMonthAmount * noOfMonths).toFixed(2);
                    let lastInterest = await getLastInterest(loan.id, loan.masterLoanId)
                    let outstandingInterest = amount - lastInterest.paidAmount;
                    let rebateAmount = lastInterest.highestInterestAmount - amount;
                    if(outstandingInterest >= 0){
                        await models.customerLoanInterest.update({ interestAmount: amount, outstandingInterest, interestRate: stepUpSlab.interestRate,rebateAmount }, { where: { id: lastInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                    }else{
                        await models.customerLoanInterest.update({ interestAmount: amount, outstandingInterest:0.00, interestRate: stepUpSlab.interestRate,rebateAmount }, { where: { id: lastInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                    }
                }
                //update current slab in customer loan table
                await models.customerLoan.update({ currentInterestRate: stepUpSlab.interestRate, currentSlab: stepUpSlab.days }, { where: { id: loan.id }, transaction: t });
            } else {
                // scenario 1
                if (noOfDays > 0) {
                    let interest = await newSlabRateInterestCalcultaion(loan.outstandingAmount, loan.currentInterestRate, loan.selectedSlab, loan.masterLoan.tenure);
                    let allInterest = await getAllNotPaidInterest(loan.id)//get all interest
                    let interestLessThanDate = await getAllInterestLessThanDate(loan.id, date);
                    let interestGreaterThanDate = await getAllInterestGreaterThanDate(loan.id, date);
                    //update interestAccrual 
                    for (const interestData of interestLessThanDate) {
                        let isDueDate = moment(date).isSame(interestData.emiDueDate);
                        if (isDueDate) {
                            let checkDebitEntry = await models.customerTransactionDetail.findOne({ where: { masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, credit: 0.00, isPenalInterest: false } });
                            if (!checkDebitEntry) {
                                let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: interestData.interestAmount, description: `Net interest due (after rebate) ${moment(interestData.emiDueDate).format('DD/MM/YYYY')}`, paymentDate: moment(), rebateAmount:interestData.rebateAmount }, { transaction: t });
                                await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                            }
                        }
                        let interestAccrual = interest.amount - interestData.paidAmount;
                        await models.customerLoanInterest.update({ interestAccrual, totalInterestAccrual: interest.amount }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                        //current date == selected interest emi due date then debit
                    }
                    if (allInterest.length != interestLessThanDate.length) {
                        let pendingNoOfDays = noOfDays - (interestLessThanDate.length * loan.selectedSlab);
                        if (pendingNoOfDays > 0) {
                            let oneDayInterest = loan.currentInterestRate / 30;
                            let oneDayAmount = loan.outstandingAmount * (oneDayInterest / 100);
                            let pendingDaysAmount = pendingNoOfDays * oneDayAmount;
                            let nextInterest = await getPendingNoOfDaysInterest(loan.id, date);
                            if (nextInterest) {
                                let amount
                                if (pendingDaysAmount > Number(nextInterest.paidAmount)) {
                                    amount = pendingDaysAmount - nextInterest.paidAmount;

                                    await models.customerLoanInterest.update({ interestAccrual: amount, totalInterestAccrual: pendingDaysAmount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                                } else {
                                    amount = nextInterest.paidAmount - pendingDaysAmount;

                                    await models.customerLoanInterest.update({ interestAccrual: 0.00, totalInterestAccrual: pendingDaysAmount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                                }
                            }
                        }
                    }
                    //Extra interest
                    //calculate extra interest
                    if (interestGreaterThanDate.length == 0) {
                        let pendingNoOfDays = noOfDays - (interestLessThanDate.length * loan.selectedSlab);
                        if (pendingNoOfDays > 0) {
                            let oneDayInterest = loan.currentInterestRate / 30;
                            let oneDayAmount = loan.outstandingAmount * (oneDayInterest / 100);
                            let pendingDaysAmount = pendingNoOfDays * oneDayAmount;
                            let extraInterest = await getExtraInterest(loan.id);
                            if (!extraInterest) {
                                let amount = pendingDaysAmount;
                                await models.customerLoanInterest.create({ loanId: loan.id, masterLoanId: loan.masterLoanId, emiStartDate: date, emiDueDate: date, emiEndDate: date, interestRate: loan.currentInterestRate, interestAmount: amount, interestAccrual: amount, totalInterestAccrual: amount, outstandingInterest: amount, isExtraDaysInterest: true }, { transaction: t });
                            } else {
                                let amount = pendingDaysAmount;
                                let interestAccrual
                                let outstandingInterest
                                if (amount > Number(extraInterest.paidAmount)) {
                                    interestAccrual = amount - extraInterest.paidAmount;
                                    outstandingInterest = amount - extraInterest.paidAmount;
                                }
                                else {
                                    interestAccrual = extraInterest.paidAmount - amount;
                                    outstandingInterest = extraInterest.paidAmount - amount;
                                }
                                await models.customerLoanInterest.update({ interestAmount: amount, interestAccrual, emiDueDate: date, emiEndDate: date, totalInterestAccrual: amount, outstandingInterest }, { where: { id: extraInterest.id }, transaction: t });
                            }
                        }
                    }
                }
            }
        }
    });
    return noOfDays;
}


let updateInterestAftertOutstandingAmount = async (date, masterLoanId) => {
    let data = await calculationDataOneLoan(masterLoanId);
    let loanInfo = data.loanInfo;
    let currentDate = moment(date);
    let noOfDays = 0;
    await sequelize.transaction(async t => {
        for (const loan of loanInfo) {
            let allInterestTable = await getAllInterest(loan.id);
            let lastPaidEmi = await checkPaidInterest(loan.id, loan.masterLoanId);
            let loanStartDate;
            if (!lastPaidEmi) {
                loanStartDate = moment(loan.masterLoan.loanStartDate);
                noOfDays = currentDate.diff(loanStartDate, 'days');
            } else {
                loanStartDate = moment(lastPaidEmi.emiDueDate);
                noOfDays = currentDate.diff(loanStartDate, 'days');
            }
            noOfDays += 1;
            let interest = await newSlabRateInterestCalcultaion(loan.outstandingAmount, loan.currentInterestRate, loan.selectedSlab, loan.masterLoan.tenure);
            let allInterest = await getAllNotPaidInterest(loan.id)//get all interest
            let interestLessThanDate = await getAllInterestLessThanDate(loan.id, date);
            //update interestAccrual & interest amount
            for (const interestData of interestLessThanDate) {
                let outstandingInterest = interest.amount - interestData.paidAmount;
                let interestAccrual = interest.amount - interestData.paidAmount;
                await models.customerLoanInterest.update({ interestAmount: interest.amount, outstandingInterest, interestAccrual }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
            }
            if (allInterest.length != interestLessThanDate.length) {
                let pendingNoOfDays = noOfDays - (interestLessThanDate.length * loan.selectedSlab);
                if (pendingNoOfDays > 0) {
                    let oneDayInterest = loan.currentInterestRate / 30;
                    let oneDayAmount = loan.outstandingAmount * (oneDayInterest / 100);
                    let pendingDaysAmount = pendingNoOfDays * oneDayAmount;
                    let nextInterest = await getPendingNoOfDaysInterest(loan.id, date);
                    if (nextInterest) {
                        let amount = pendingDaysAmount - nextInterest.paidAmount;
                        await models.customerLoanInterest.update({ interestAccrual: amount, outstandingInterest: amount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                    }
                }
            }
            //update all interest amount
            for (const interestData of allInterest) {
                let rebateAmount = interestData.highestInterestAmount - interest.amount;
                let outstandingInterest = interest.amount - interestData.paidAmount;
                await models.customerLoanInterest.update({ interestAmount: interest.amount, outstandingInterest, rebateAmount }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
            }
            //update last interest if changed
            if (!Number.isInteger(interest.length)) {
                const noOfMonths = (((loan.masterLoan.tenure * 30) - ((allInterestTable.length - 1) * loan.selectedSlab)) / 30)
                let oneMonthAmount = interest.amount / (loan.selectedSlab / 30);
                let amount = (oneMonthAmount * noOfMonths).toFixed(2);
                let lastInterest = await getLastInterest(loan.id, loan.masterLoanId)
                let rebateAmount = lastInterest.highestInterestAmount - amount;
                let outstandingInterest = amount - lastInterest.paidAmount;
                await models.customerLoanInterest.update({ interestAmount: amount, outstandingInterest, rebateAmount }, { where: { id: lastInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
            }
        }
    });
    return transactionData;
}


let customerLoanDetailsByMasterLoanDetails = async (masterLoanId) => {
    let loan = await models.customerLoanMaster.findOne({
        where: { isActive: true, id: masterLoanId },
        order: [
            [models.customerLoan, 'id', 'asc']
        ],
        include: [{
            model: models.customerLoan,
            as: 'customerLoan',
            where: { isActive: true },
            include: [
                {
                    model: models.scheme,
                    as: 'scheme',
                    attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                }
            ]
        }]
    });

    return { loan }
}


let generateTranscationAndUpdateInterestValue = async (loanArray, amount, createdBy, paymentReceivedDate) => {


    let transaction = []
    let pendingSecuredAmount = amount
    let interestAccrualAmount = amount
    for (let index = 0; index < loanArray.length; index++) {
        let transactionData = {
            // transactionAmont: 0,
            createdBy: createdBy,
            paymentDate: Date.now()
        }
        // outsatnding 
        if (pendingSecuredAmount <= 0) {

            break;

        }   else if (pendingSecuredAmount >= Number(loanArray[index]['outstandingInterest']) || Number(loanArray[index]['outstandingInterest']) - pendingSecuredAmount <= 0.5) {

            loanArray[index]['paidAmount'] = Number(loanArray[index]['paidAmount']) + Number(loanArray[index]['outstandingInterest'])
            loanArray[index]['emiStatus'] = "paid"
            transactionData.loanInterestId = loanArray[index]['id']
            transactionData.isExtraDaysInterest = loanArray[index]['isExtraDaysInterest']
            transactionData.interestAmount = loanArray[index]['interestAmount']
            transactionData.highestInterestAmount = loanArray[index]['highestInterestAmount']
            transactionData.rebateAmount = loanArray[index]['rebateAmount']
            transactionData.penalInterest = loanArray[index]['penalInterest']
            transactionData.emiDueDate = loanArray[index]['emiDueDate']
            transactionData.loanId = loanArray[index]['loanId']
            transactionData.masterLoanId = loanArray[index]['masterLoanId']
            transactionData.credit = loanArray[index]['outstandingInterest']
            transactionData.loanUniqueId = loanArray[index]['customerLoan'].loanUniqueId
            transaction.push(transactionData)
            pendingSecuredAmount = Number((Number(pendingSecuredAmount) - Number(loanArray[index]['outstandingInterest'])).toFixed(2))
            loanArray[index]['outstandingInterest'] = 0.00
            loanArray[index]['emiReceivedDate'] = paymentReceivedDate
        }else if (pendingSecuredAmount < Number(loanArray[index]['outstandingInterest']) && pendingSecuredAmount >= 0.5) {

            loanArray[index]['emiStatus'] = "partially paid"
            loanArray[index]['paidAmount'] = Number(loanArray[index]['paidAmount']) + Number(pendingSecuredAmount.toFixed(2))
            transactionData.loanInterestId = loanArray[index]['id']
            transactionData.isExtraDaysInterest = loanArray[index]['isExtraDaysInterest']
            transactionData.interestAmount = loanArray[index]['interestAmount']
            transactionData.highestInterestAmount = loanArray[index]['highestInterestAmount']
            transactionData.rebateAmount = loanArray[index]['rebateAmount']
            transactionData.penalInterest = loanArray[index]['penalInterest']
            transactionData.emiDueDate = loanArray[index]['emiDueDate']
            transactionData.loanId = loanArray[index]['loanId']
            transactionData.masterLoanId = loanArray[index]['masterLoanId']
            transactionData.credit = pendingSecuredAmount.toFixed(2)
            transactionData.loanUniqueId = loanArray[index]['customerLoan'].loanUniqueId
            transaction.push(transactionData)
            pendingSecuredAmount = Number((Number(pendingSecuredAmount) - Number(loanArray[index]['outstandingInterest'])).toFixed(2))
            loanArray[index]['outstandingInterest'] = 0.00
            loanArray[index]['emiReceivedDate'] = paymentReceivedDate

        }
       

    }
    for (let index = 0; index < loanArray.length; index++) {
        const element = loanArray[index];
        if (Number(element.interestAccrual) >= Number(interestAccrualAmount)) {
            element.interestAccrual = element.interestAccrual - interestAccrualAmount
            // element.totalInterestAccrual = element.interestAccrual
            interestAccrualAmount = element.interestAccrual
        } else if (Number(element.interestAccrual) < Number(interestAccrualAmount)) {
            element.interestAccrual = 0.00;
            // element.totalInterestAccrual = element.interestAccrual
        }
    }
    return { loanArray, transaction }
}

let getPenalDateOfMasterLoan = async (amount, loan, securedPaidAmount, unsecuredPaidAmount) => {

    let unsecuredPenalDate;
    let unsecuredPenalData;
    let securedPenalDate = await lastPenalPaidDate(loan.customerLoan[0], amount.securedPenalInterest, securedPaidAmount)
    if (loan.isUnsecuredSchemeApplied) {
        unsecuredPenalDate = await lastPenalPaidDate(loan.customerLoan[1], amount.unsecuredPenalInterest, unsecuredPaidAmount)
        unsecuredPenalData = {
            unsecuredPenalDate,
            loanId: loan.customerLoan[1].id
        }
    }
    let securedPenalData = {
        securedPenalDate,
        loanId: loan.customerLoan[0].id
    }

    return { securedPenalData, unsecuredPenalData }
}

let lastPenalPaidDate = async (loan, appliedPenalInterest, paidAmount) => {
    let penal = (loan.penalInterest / 100)
    let noOfDaysInYear = 360
    let singleDayPenal = Number(((loan.outstandingAmount * penal) / noOfDaysInYear).toFixed(2))
    let numberOfDaysPaid = Math.floor(paidAmount / singleDayPenal)
    let dueDateFromDb
    //check here
    if (loan.penalInterestLastReceivedDate != null) {
        dueDateFromDb = loan.penalInterestLastReceivedDate
    } else {
        let dataInfo = await getInterestTableOfSingleLoan(loan.id)
        dueDateFromDb = dataInfo[0].emiDueDate
    }
    console.log(dueDateFromDb, singleDayPenal)
    var newDate = moment(dueDateFromDb, "YYYY-MM-DD").add(numberOfDaysPaid, 'days').format()
    return newDate
}

let allInterestPayment = async (transactionId, newTransactionSplitUp, securedLoanDetails, unsecuredLoanDetails, receivedDate) => {

    let createdBy = 1
    let transactionSplitUp = await models.customerTransactionSplitUp.findAll(
        {
            where: { customerLoanTransactionId: transactionId },
            order: [['loanId', 'asc']],
        },
    )

    if (transactionSplitUp.length == 0) {
        transactionSplitUp = newTransactionSplitUp
    }

    console.log(transactionSplitUp)
    // let outstandingAmount = Number(loan.outstandingAmount.toFixed(2))
    let securedPenalInterest = Number(transactionSplitUp[0].penal)
    let securedInterest = Number(transactionSplitUp[0].interest)
    let securedOutstandingAmount = Number(transactionSplitUp[0].loanOutstanding)

    let unsecuredInterest = 0
    let unsecuredPenalInterest = 0
    let unsecuredOutstandingAmount = 0

    if (transactionSplitUp.length > 1) {
        unsecuredInterest = Number(transactionSplitUp[1].interest)
        unsecuredPenalInterest = Number(transactionSplitUp[1].penal)
        unsecuredOutstandingAmount = Number(transactionSplitUp[1].loanOutstanding)
    }

    // divinding in ratio





    let transactionDetails = []

    if (!securedLoanDetails) {

        securedLoanDetails = await models.customerLoanInterest.findAll({
            where: {
                loanId: transactionSplitUp[0].loanId,
                emiStatus: { [Op.in]: ['pending', 'partially paid'] }
            },
            order: [['emiDueDate']],
            include: {
                model: models.customerLoan,
                as: 'customerLoan',
                attributes: ['loanUniqueId']
            }
        })
    }


    let temp = []
    for (let index = 0; index < securedLoanDetails.length; index++) {
        temp.push(securedLoanDetails[index].dataValues)
    }
    securedLoanDetails = []
    if (securedPenalInterest > 0) {
        temp = await penalInterestPayment(temp, securedPenalInterest, createdBy, receivedDate);
        Array.prototype.push.apply(transactionDetails, temp.transaction)
        securedLoanDetails = temp.loanArray
    } else {
        securedLoanDetails = temp;
    }
    // console.log(securedLoanDetails)

    if (securedInterest > 0) {
        newSecuredDetails = await generateTranscationAndUpdateInterestValue(securedLoanDetails, securedInterest, createdBy, receivedDate)
        securedLoanDetails = newSecuredDetails.loanArray
        Array.prototype.push.apply(transactionDetails, newSecuredDetails.transaction)

    }
    // let unsecuredLoanDetails
    // unsecure
    if (transactionSplitUp.length > 1) {

        if (!unsecuredLoanDetails) {

            unsecuredLoanDetails = await models.customerLoanInterest.findAll({
                where: {
                    loanId: transactionSplitUp[1].loanId,
                    emiStatus: { [Op.in]: ['pending', 'partially paid'] }
                },
                order: [['emiDueDate']],
                include: {
                    model: models.customerLoan,
                    as: 'customerLoan',
                    attributes: ['loanUniqueId']
                }
            })
        }


        let temp = []
        for (let index = 0; index < unsecuredLoanDetails.length; index++) {
            temp.push(unsecuredLoanDetails[index].dataValues)
        }
        unsecuredLoanDetails = []
        if (unsecuredPenalInterest > 0) {

            temp = await penalInterestPayment(temp, unsecuredPenalInterest, createdBy, receivedDate);
            Array.prototype.push.apply(transactionDetails, temp.transaction)
            unsecuredLoanDetails = temp.loanArray
        } else {
            unsecuredLoanDetails = temp;
            // console.log(securedLoanDetails)
        }

        if (unsecuredInterest > 0) {
            let newUnsecuredDetails = await generateTranscationAndUpdateInterestValue(unsecuredLoanDetails, unsecuredInterest, createdBy, receivedDate)
            unsecuredLoanDetails = newUnsecuredDetails.loanArray
            Array.prototype.push.apply(transactionDetails, newUnsecuredDetails.transaction)
        }
    }

    // if (securedPenalInterest > 0) {
    //     var penalDate = await getPenalDateOfMasterLoan(amount, loanDetails.loan, securedPenalInterest, unsecuredPenalInterest)
    // }

    return { transactionDetails, securedLoanDetails, unsecuredLoanDetails }
}

let penalInterestPayment = async (loanArray, totalPenalAmount, createdBy, receivedDate) => {
    console.log(totalPenalAmount)

    let transaction = []

    let pendingPenalAmount = totalPenalAmount
    let penalAccuralAmount = totalPenalAmount

    //add penal next code

    for (let index = 0; index < loanArray.length; index++) {
        if (loanArray[index].emiDueDate > receivedDate && loanArray[index].emiStartDate < receivedDate) {

            let transactionData = {
                // transactionAmont: 0,
                createdBy: createdBy,
            }
            // loanArray[index]['penalPaid'] = pendingPenalAmount.toFixed(2)
            transactionData.credit = loanArray[index]['penalOutstanding']
            transactionData.loanInterestId = loanArray[index]['id']
            transactionData.isExtraDaysInterest = loanArray[index]['isExtraDaysInterest']
            transactionData.interestAmount = loanArray[index]['interestAmount']
            transactionData.penalInterest = loanArray[index]['penalInterest']
            transactionData.emiDueDate = loanArray[index]['emiDueDate']
            transactionData.loanId = loanArray[index]['loanId']
            transactionData.masterLoanId = loanArray[index]['masterLoanId']
            transactionData.isPenalInterest = true;
            transactionData.loanUniqueId = loanArray[index]['customerLoan'].loanUniqueId

            transaction.push(transactionData)
        }
    }

    for (let index = 0; index < loanArray.length; index++) {

        let transactionData = {
            // transactionAmont: 0,
            createdBy: createdBy,
        }

        if (pendingPenalAmount <= 0) {
            break;
        } else if (pendingPenalAmount < Number(loanArray[index]['penalInterest']) && Number(loanArray[index]['penalOutstanding']) > 0) {

            loanArray[index]['penalPaid'] = Number(loanArray[index]['penalPaid']) + Number(pendingPenalAmount.toFixed(2))
            // loanArray[index]['penalPaid'] = pendingPenalAmount.toFixed(2)
            pendingPenalAmount = (Number(loanArray[index]['penalInterest']) - Number(pendingPenalAmount)).toFixed(2)
            loanArray[index]['penalOutstanding'] = Number(loanArray[index]['penalOutstanding']) - Number(pendingPenalAmount);
            pendingPenalAmount = 0.00;

        } else if (pendingPenalAmount >= Number(loanArray[index]['penalInterest']) && Number(loanArray[index]['penalOutstanding']) > 0) {

            loanArray[index]['penalPaid'] = Number(loanArray[index]['penalPaid']) + Number(loanArray[index]['penalOutstanding'])
            // loanArray[index]['penalPaid'] = (Number(loanArray[index].penalOutstanding)).toFixed(2)
            pendingPenalAmount = Number(pendingPenalAmount) - Number(loanArray[index]['penalOutstanding'])
            loanArray[index]['penalOutstanding'] = 0;
        }

    }
    //add penal next code


    for (let index = 0; index < loanArray.length; index++) {
        const element = loanArray[index];
        if (Number(element.penalAccrual) >= Number(penalAccuralAmount)) {
            element.penalAccrual = element.penalAccrual - penalAccuralAmount
            penalAccuralAmount = element.penalAccrual
        } else if (Number(element.penalAccrual) < Number(penalAccuralAmount)) {
            element.penalAccrual = 0;

        }
    }
    console.log(transaction)
    return { loanArray, transaction }

    //ravi ka purana code
    for (let index = 0; index < loanArray.length; index++) {

        let transactionData = {
            // transactionAmont: 0,
            createdBy: createdBy,
        }



        if (pendingPenalAmount <= 0) {

            break;

        } else if (pendingPenalAmount < Number(loanArray[index]['penalInterest']) && Number(loanArray[index]['penalOutstanding']) > 0) {

            loanArray[index]['penalPaid'] = pendingPenalAmount.toFixed(2)
            transactionData.credit = pendingPenalAmount.toFixed(2)
            transactionData.loanInterestId = loanArray[index]['id']
            transactionData.isExtraDaysInterest = loanArray[index]['isExtraDaysInterest']
            transactionData.interestAmount = loanArray[index]['interestAmount']
            transactionData.penalInterest = loanArray[index]['penalInterest']
            transactionData.emiDueDate = loanArray[index]['emiDueDate']
            transactionData.loanId = loanArray[index]['loanId']
            transactionData.masterLoanId = loanArray[index]['masterLoanId']
            transactionData.isPenalInterest = true;
            transactionData.loanUniqueId = loanArray[index]['customerLoan'].loanUniqueId
            transaction.push(transactionData)
            pendingPenalAmount = (Number(loanArray[index]['penalInterest']) - Number(pendingPenalAmount)).toFixed(2)
            loanArray[index]['penalOutstanding'] = Number(loanArray[index]['penalOutstanding']) - Number(loanArray[index]['penalPaid']);
            pendingPenalAmount = 0.00;

        } else if (pendingPenalAmount >= Number(loanArray[index]['penalInterest']) && Number(loanArray[index]['penalOutstanding']) > 0) {

            loanArray[index]['penalPaid'] = pendingPenalAmount.toFixed(2)
            transactionData.credit = loanArray[index]['penalOutstanding']
            transactionData.loanInterestId = loanArray[index]['id']
            transactionData.isExtraDaysInterest = loanArray[index]['isExtraDaysInterest']
            transactionData.interestAmount = loanArray[index]['interestAmount']
            transactionData.penalInterest = loanArray[index]['penalInterest']
            transactionData.emiDueDate = loanArray[index]['emiDueDate']
            transactionData.loanId = loanArray[index]['loanId']
            transactionData.masterLoanId = loanArray[index]['masterLoanId']
            transactionData.isPenalInterest = true;
            transactionData.loanUniqueId = loanArray[index]['customerLoan'].loanUniqueId
            transaction.push(transactionData)
            pendingPenalAmount = Number(pendingPenalAmount) - Number(loanArray[index]['penalOutstanding'])
            loanArray[index]['penalOutstanding'] = 0;
        }

    }

    for (let index = 0; index < loanArray.length; index++) {
        const element = loanArray[index];
        if (Number(element.penalAccrual) >= Number(penalAccuralAmount)) {
            element.penalAccrual = element.penalAccrual - penalAccuralAmount
            penalAccuralAmount = element.penalAccrual
        } else if (Number(element.penalAccrual) < Number(penalAccuralAmount)) {
            element.penalAccrual = 0;

        }
    }
    //ravi ka purana code

}

let getFirstInterestToPay = async (loanId, masterLaonId) => {
    let firstInterest = await models.customerLoanInterest.findOne({
        where: { loanId: loanId, masterLoanId: masterLaonId, emiStatus: { [Op.notIn]: ['paid'] } },
        order: [['emiDueDate', 'ASC']],
        attributes: ['id', 'paidAmount', 'emiDueDate'],
        isExtraDaysInterest: false
    })
    return firstInterest
}


let getAllPaidInterest = async (loanId) => {
    let allPaidInterest = await models.customerLoanInterest.findAll({
        where: { loanId: loanId, emiStatus: { [Op.in]: ['paid'] } },
        order: [['id', 'asc']],
        isExtraDaysInterest: false
    });
    return allPaidInterest;
}

let getSingleLoanDetail = async (loanId, masterLoanId) => {

    let whereCondition = {}
    if (!check.isEmpty(loanId)) {
        whereCondition = { id: loanId }
    }

    let customerLoanInterest = await models.customerLoanInterest.findAll({
        order: [
            ['id', 'asc']
        ],
        where: {
            emiDueDate: { [Op.gte]: moment().format('YYYY-MM-DD') },
            emiStatus: { [Op.not]: 'paid' },
            masterLoanId: masterLoanId
        },
    })

    let customerLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['id', 'loanStartDate', 'loanEndDate', 'tenure', 'termsAndCondition'],
        order: [
            [models.customerLoanDisbursement, 'loanId', 'asc'],
            [models.customerLoan, 'id', 'asc'],
            // [models.customerLoanInterest, 'id', 'asc']
        ],
        include: [
            // {
            //     model: models.customerLoanInterest,
            //     as: 'customerLoanInterest',
            //     where: {
            //         emiDueDate: { [Op.gte]: moment().format('YYYY-MM-DD') },
            //         emiStatus: { [Op.not]: 'paid' }
            //     },
            //     // attributes: ['emiDueDate', 'emiStatus'],

            // },
            {
                model: models.customerLoan,
                as: 'customerLoan',
                where: whereCondition,
                attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                include: [
                    {
                        model: models.scheme,
                        as: 'scheme'
                    },
                    {
                        model: models.customerLoan,
                        as: 'unsecuredLoan',
                        attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                        include: [{
                            model: models.scheme,
                            as: 'scheme',
                        }]
                    }
                ]
            },
            {
                model: models.partRelease,
                as: 'partRelease',
            },
            {
                model: models.fullRelease,
                as: 'fullRelease',
            },
            {
                model: models.loanStage,
                as: 'loanStage',
                attributes: ['id', 'name']
            },
            {
                model: models.customerLoanTransfer,
                as: "loanTransfer",
                attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
            },
            {
                model: models.customerLoanPersonalDetail,
                as: 'loanPersonalDetail',
            }, {
                model: models.customerLoanBankDetail,
                as: 'loanBankDetail',
            }, {
                model: models.customerLoanNomineeDetail,
                as: 'loanNomineeDetail',
            },
            {
                model: models.customerLoanOrnamentsDetail,
                as: 'loanOrnamentsDetail',
                include: [
                    {
                        model: models.ornamentType,
                        as: "ornamentType"
                    }
                ]
            },
            {
                model: models.customerLoanDocument,
                as: 'customerLoanDocument'
            },
            {
                model: models.customer,
                as: 'customer',
                attributes: ['id', 'customerUniqueId', 'firstName', 'lastName', 'panType', 'panImage', 'mobileNumber'],
            },
            {
                model: models.customerLoanDisbursement,
                as: 'customerLoanDisbursement'
            }
        ]
    })

    let packet = await models.customerLoanPackageDetails.findAll({
        where: { masterLoanId: masterLoanId },
        include: [{
            model: models.packet,
            include: [{
                model: models.customerLoanOrnamentsDetail,
                include: [{
                    model: models.ornamentType,
                    as: 'ornamentType'
                }]
            }]
        }]
    })
    customerLoan.dataValues.customerLoanInterest = customerLoanInterest
    customerLoan.dataValues.loanPacketDetails = packet

    return customerLoan
}



async function getAmountLoanSplitUpData(loan, amount, splitUpRatioAmount) {

    let { securedPenalInterest, unsecuredPenalInterest, securedInterest, unsecuredInterest } = await payableAmountForLoan(amount, loan)

    let securedOutstandingAmount = loan.customerLoan[0].outstandingAmount
    let unsecuredOutstandingAmount = 0
    if (loan.isUnsecuredSchemeApplied) {
        unsecuredOutstandingAmount = loan.customerLoan[1].outstandingAmount
    }
    let totalOutstandingAmount = Number(securedOutstandingAmount) + Number(unsecuredOutstandingAmount)

    let securedLoanId = loan.customerLoan[0].id
    let securedRatio = Number((securedOutstandingAmount / totalOutstandingAmount * (splitUpRatioAmount)).toFixed(2))
    let newSecuredOutstandingAmount = securedOutstandingAmount - securedRatio
    let newUnsecuredOutstandingAmount = 0
    let unsecuredRatio = 0
    let unsecuredLoanId = null
    if (loan.isUnsecuredSchemeApplied) {
        unsecuredLoanId = loan.customerLoan[1].id
        unsecuredRatio = Number((unsecuredOutstandingAmount / totalOutstandingAmount * splitUpRatioAmount).toFixed(2))
        newUnsecuredOutstandingAmount = Number(unsecuredOutstandingAmount) - unsecuredRatio
    }
    let newMasterOutstandingAmount = newSecuredOutstandingAmount + newUnsecuredOutstandingAmount

    let isUnsecuredSchemeApplied = false
    if (loan.isUnsecuredSchemeApplied) {
        isUnsecuredSchemeApplied = true
    }



    let data = {
        securedOutstandingAmount,
        unsecuredOutstandingAmount,
        totalOutstandingAmount,
        securedRatio,
        unsecuredRatio,
        newSecuredOutstandingAmount,
        newUnsecuredOutstandingAmount,
        newMasterOutstandingAmount,
        isUnsecuredSchemeApplied,
        securedPenalInterest,
        unsecuredPenalInterest,
        securedInterest,
        unsecuredInterest,
        securedLoanId,
        unsecuredLoanId
    }
    return data

}

async function interestSplit(loan, amount, splitUpRatioAmount) {
    let { securedPenalInterest, unsecuredPenalInterest, securedInterest, unsecuredInterest } = await payableAmountForLoan(amount, loan)

    let securedOutstandingAmount = loan.customerLoan[0].outstandingAmount
    let securedInterestRate = loan.customerLoan[0].interestRate
    let unsecuredOutstandingAmount = 0
    let unsecuredInterestRate = 0
    if (loan.isUnsecuredSchemeApplied) {
        unsecuredOutstandingAmount = loan.customerLoan[1].outstandingAmount
        unsecuredInterestRate = loan.customerLoan[1].interestRate

    }
    let totalOutstandingAmount = Number(securedOutstandingAmount) + Number(unsecuredOutstandingAmount)

    let securedLoanId = loan.customerLoan[0].id
    let securedRatio = Number(((securedOutstandingAmount * securedInterestRate / ((securedOutstandingAmount * securedInterestRate) + (unsecuredOutstandingAmount * unsecuredInterestRate))) * splitUpRatioAmount).toFixed(2))
    let newSecuredOutstandingAmount = securedOutstandingAmount - securedRatio
    let newUnsecuredOutstandingAmount = 0
    let unsecuredRatio = 0
    let unsecuredLoanId = null
    if (loan.isUnsecuredSchemeApplied) {
        unsecuredLoanId = loan.customerLoan[1].id
        unsecuredRatio = Number(((unsecuredOutstandingAmount * unsecuredInterestRate / ((securedOutstandingAmount * securedInterestRate) + (unsecuredOutstandingAmount * unsecuredInterestRate))) * splitUpRatioAmount).toFixed(2))
        newUnsecuredOutstandingAmount = Number(unsecuredOutstandingAmount) - unsecuredRatio
    }
    let newMasterOutstandingAmount = newSecuredOutstandingAmount + newUnsecuredOutstandingAmount

    let isUnsecuredSchemeApplied = false
    if (loan.isUnsecuredSchemeApplied) {
        isUnsecuredSchemeApplied = true
    }



    let data = {
        securedOutstandingAmount,
        unsecuredOutstandingAmount,
        totalOutstandingAmount,
        securedRatio,
        unsecuredRatio,
        newSecuredOutstandingAmount,
        newUnsecuredOutstandingAmount,
        newMasterOutstandingAmount,
        isUnsecuredSchemeApplied,
        securedPenalInterest,
        unsecuredPenalInterest,
        securedInterest,
        unsecuredInterest,
        securedLoanId,
        unsecuredLoanId
    }
    return data

}

let nextDueDateInterest = async (loan) => {

    let paymentFrequency = loan.paymentFrequency
    let securedInterest = loan.customerLoan[0].currentInterestRate
    let securedOutstandingAmount = loan.customerLoan[0].outstandingAmount
    let securedRebate = 0;
    let unsecuredRebate = 0;


    let securedPerDayInterestAmount = ((securedInterest / 100) * securedOutstandingAmount * (paymentFrequency / 30)) / paymentFrequency
    let secured = await models.customerLoanInterest.findAll({
        where: { emiStatus: { [Op.notIn]: ["paid"] }, loanId: loan.customerLoan[0].id, },
        order: [['emiEndDate', 'asc']]
    });

    var securedTotalInterest = 0
    var unsecuredTotalInterest = 0

    if (secured.length > 0) {
        let startDate = moment(secured[0].emiStartDate)
        let index = secured.findIndex(ele => {
            let loanEndDate = moment(ele.emiEndDate);
            let currentDate = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
            let noOfDays = loanEndDate.diff(currentDate, 'days');
            return noOfDays >= 0
        })
        let securedMonthRebateInterest = 0
        for (let securedIndex = 0; securedIndex <= index; securedIndex++) {
            securedMonthRebateInterest += Number(secured[securedIndex].rebateAmount);
        }

        if (index < 0) {
            securedTotalInterest = 0
            secured.forEach(interest => {
                securedTotalInterest += Number(interest.outstandingInterest)
            })
        } else {
            let partialPaidSecuredIndex = secured.findIndex(ele => {
                return ele.emiStatus == 'partially paid'
            })
            let paidAmount = 0
            if (partialPaidSecuredIndex >= 0) {
                paidAmount = secured[partialPaidSecuredIndex].paidAmount
            }

            let dueDate = moment(secured[index].emiEndDate)

            let noOfDays = dueDate.diff(startDate, 'days')
            let months = Math.ceil(noOfDays / 30)
            let securedMonthInterest = (securedPerDayInterestAmount * (months * 30))
            // let securedMonthRebateInterest = (securedPerDayRebateInterestAmount * (months * 30))
            if (securedMonthInterest > Number(paidAmount)) {
                securedTotalInterest = securedMonthInterest - paidAmount;
            }
            else {
                securedTotalInterest = paidAmount - securedMonthInterest;

            }
            securedTotalInterest = securedTotalInterest.toFixed(2)
            securedRebate = securedMonthRebateInterest.toFixed(2)
        }
    }
    if (loan.customerLoan.length > 1) {
        let unsecuredInterest = loan.customerLoan[1].currentInterestRate
        let unsecuredOutstandingAmount = loan.customerLoan[1].outstandingAmount
        var unsecuredPerDayInterestAmount = ((unsecuredInterest / 100) * unsecuredOutstandingAmount * (paymentFrequency / 30)) / paymentFrequency

        let unsecured = await models.customerLoanInterest.findAll({
            where: { emiStatus: { [Op.notIn]: ["paid"] }, loanId: loan.customerLoan[1].id, },
            order: [['emiEndDate', 'asc']]
        });

        if (unsecured.length > 0) {
            let startDate = moment(unsecured[0].emiStartDate)
            let index = unsecured.findIndex(ele => {
                let loanEndDate = moment(ele.emiEndDate);
                let currentDate = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                let noOfDays = loanEndDate.diff(currentDate, 'days');
                return noOfDays >= 0
            })
            var unsecureRebateInterest = 0;
            for (let unsecuredIndex = 0; unsecuredIndex <= index; unsecuredIndex++) {
                unsecureRebateInterest += Number(unsecured[unsecuredIndex].rebateAmount);
            }


            if (index < 0) {
                unsecuredTotalInterest = 0
                unsecured.forEach(interest => {
                    unsecuredTotalInterest += Number(interest.outstandingInterest)
                })
            } else {
                let partialPaidSecuredIndex = unsecured.findIndex(ele => {
                    return ele.emiStatus == 'partially paid'
                })


                let unsecuredPaidAmount = 0
                if (partialPaidSecuredIndex >= 0) {
                    unsecuredPaidAmount = unsecured[partialPaidSecuredIndex].paidAmount
                }

                let dueDate = moment(unsecured[index].emiEndDate)

                let noOfDays = dueDate.diff(startDate, 'days')
                let months = Math.ceil(noOfDays / 30)
                let monthsViseInterest = (unsecuredPerDayInterestAmount * (months * 30))
                // let unsecureRebateInterest = (unsecuredPerDayRebateInterestAmount * (months * 30))

                if (monthsViseInterest > Number(unsecuredPaidAmount)) {
                    unsecuredTotalInterest = monthsViseInterest - unsecuredPaidAmount
                } else {
                    unsecuredTotalInterest = unsecuredPaidAmount - monthsViseInterest

                }
                unsecuredTotalInterest = unsecuredTotalInterest.toFixed(2)
                unsecuredRebate = unsecureRebateInterest.toFixed(2)
            }


        }
    }




    return { securedTotalInterest, unsecuredTotalInterest, securedRebate, unsecuredRebate }
}

let splitAmountIntoSecuredAndUnsecured = async (customerLoan, paidAmount) => {

    let loanAmount = customerLoan.outstandingAmount
    let securedLoanAmount = customerLoan.customerLoan[0].outstandingAmount
    let unsecuredLoanAmount = customerLoan.customerLoan[1].outstandingAmount

    let securedRatio = securedLoanAmount / loanAmount * paidAmount
    let unsecuredRatio = unsecuredLoanAmount / loanAmount * paidAmount

    return { securedRatio, unsecuredRatio }
}


let getTransactionPrincipalAmount = async (customerLoanTransactionId, transactionSecured, transactionUnSecured) => {
    let transactionDataSecured = await models.customerTransactionSplitUp.findOne({ where: { customerLoanTransactionId: customerLoanTransactionId, isSecured: true } });
    let transactionDataUnSecured = await models.customerTransactionSplitUp.findOne({ where: { customerLoanTransactionId: customerLoanTransactionId, isSecured: false } });
    if (!transactionDataSecured) {
        transactionDataSecured = transactionSecured;
    }
    if (!transactionDataUnSecured) {
        transactionDataUnSecured = transactionUnSecured;
    }
    let securedPayableOutstanding = 0;
    let unSecuredPayableOutstanding = 0;
    let totalPayableOutstanding = 0;
    securedPayableOutstanding = transactionDataSecured.payableOutstanding;
    if (transactionDataUnSecured) {
        unSecuredPayableOutstanding = transactionDataUnSecured.payableOutstanding;
    }
    totalPayableOutstanding = Number(securedPayableOutstanding) + Number(unSecuredPayableOutstanding);
    let loanInfo = await models.customerLoanMaster.findOne({
        where: { id: transactionDataSecured.masterLoanId },
        order: [
            [models.customerLoan, 'id', 'asc']
        ],
        attributes: ['id', 'outstandingAmount'],
        include: [{
            model: models.customerLoan,
            as: 'customerLoan',
            attributes: ['id', 'outstandingAmount', 'loanUniqueId']
        }]
    });
    let securedOutstandingAmount = Number(loanInfo.customerLoan[0].outstandingAmount - securedPayableOutstanding);
    let securedLoanUniqueId = loanInfo.customerLoan[0].loanUniqueId;
    let unSecuredOutstandingAmount = 0;
    let unSecuredLoanUniqueId;
    if (transactionDataUnSecured) {
        unSecuredOutstandingAmount = Number(loanInfo.customerLoan[1].outstandingAmount - unSecuredPayableOutstanding);
        unSecuredLoanUniqueId = loanInfo.customerLoan[1].loanUniqueId;
    }
    let outstandingAmount = Number(loanInfo.outstandingAmount - totalPayableOutstanding);
    return { securedPayableOutstanding, unSecuredPayableOutstanding, transactionDataSecured, transactionDataUnSecured, securedOutstandingAmount, unSecuredOutstandingAmount, outstandingAmount, securedLoanUniqueId, unSecuredLoanUniqueId }
}


let getSingleMasterLoanDetail = async (masterLoanId) => {
    let masterLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
        order: [
            [models.customerLoanDisbursement, 'loanId', 'asc'],
            [models.customerLoan, 'id', 'asc']
        ],
        include: [
            {
                model: models.customerLoan,
                as: 'customerLoan',
                attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
            },
            {
                model: models.loanStage,
                as: 'loanStage',
                attributes: ['id', 'name']
            },
            {
                model: models.customerLoanTransfer,
                as: "loanTransfer",
                attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
            },
            {
                model: models.customerLoanPersonalDetail,
                as: 'loanPersonalDetail',
            }, {
                model: models.customerLoanBankDetail,
                as: 'loanBankDetail',
            }, {
                model: models.customerLoanNomineeDetail,
                as: 'loanNomineeDetail',
            },
            {
                model: models.customerLoanOrnamentsDetail,
                as: 'loanOrnamentsDetail',
                include: [
                    {
                        model: models.ornamentType,
                        as: "ornamentType"
                    }
                ]
            },
            {
                model: models.customerLoanDocument,
                as: 'customerLoanDocument'
            },
            {
                model: models.customer,
                as: 'customer',
                attributes: ['id', 'customerUniqueId', 'firstName', 'lastName', 'panType', 'panImage', 'mobileNumber'],
            },
            {
                model: models.customerLoanDisbursement,
                as: 'customerLoanDisbursement'
            }
        ]
    });

    let packet = await models.customerLoanPackageDetails.findAll({
        where: { masterLoanId: masterLoanId },
        include: [{
            model: models.packet,
            include: [{
                model: models.customerLoanOrnamentsDetail,
                include: [{
                    model: models.ornamentType,
                    as: 'ornamentType'
                }]
            }]
        }]
    })
    masterLoan.dataValues.loanPacketDetails = packet

    return masterLoan
}

let stepDown = async (paymentDate, loan, noOfDays) => {

    let emiTable = await models.customerLoanInterest.findAll({
        where: {
            loanId: loan.customerLoan[0].id,
            emiDueDate: { [Op.lte]: paymentDate },
            emiStatus: { [Op.notIn]: ['paid'] }
        },
        order: [['id', 'asc']]

    })




    let newEmiTable = []
    let lastDueDate
    let noDays
    let startDate

    if (emiTable.length > 0) {
        lastDueDate = emiTable[emiTable.length - 1].emiDueDate;
        startDate = emiTable[0].emiStartDate;
        noDays = moment(paymentDate).diff(moment(startDate), 'days')
    } else {
        emiTable = await models.customerLoanInterest.findAll({
            where: {
                loanId: loan.customerLoan[0].id,
                emiStatus: { [Op.notIn]: ['paid'] }
            },
            order: [['id', 'asc']]
        })

        if (emiTable.length == 0) {
            return { newEmiTable }
        }
        lastDueDate = emiTable[0].emiDueDate;
        startDate = emiTable[0].emiStartDate;
        noDays = moment(paymentDate).diff(moment(startDate), 'days')
    }

    let slab = Math.ceil((noDays + 1) / 30) * 30

    for (let index = 0; index < loan.customerLoan.length; index++) {
        const element = loan.customerLoan[index];
        let interestData = await models.customerLoanSlabRate.findOne({
            where: {
                loanId: element.id,
                days: { [Op.gte]: slab }
            },

        })

        if (interestData && Number(loan.paymentFrequency) <= Number(interestData.days)) {
            if (index == 0)
                var stepDownInterest = interestData.interestRate;

            else
                var unsecuredStepDownInterest = interestData.interestRate;

            var currentSlabRate = interestData.days;
            var tempTable = await models.customerLoanInterest.findAll({
                where: {
                    loanId: element.id,
                    emiStatus: { [Op.notIn]: ['paid'] }
                }
            })

            for (let index = 0; index < tempTable.length; index++) {
                const element = tempTable[index].dataValues;
                element.interestRate = stepDownInterest;
            }

            newEmiTable = [...newEmiTable, ...tempTable]
        }
    }



    return { newEmiTable, currentSlabRate, securedInterest: stepDownInterest, unsecuredInterest: unsecuredStepDownInterest }
}

let penalInterestCalculationForSelectedLoan = async (date, masterLaonId) => {
    let info = await calculationDataOneLoan(masterLaonId);
    let data = info.loanInfo
    let { gracePeriodDays, noOfDaysInYear } = info
    for (let i = 0; i < data.length; i++) {
        let penal = (data[i].penalInterest / 100)
        let selectedSlab = data[i].selectedSlab
        let dataInfo = await getInterestTableOfSingleLoan(data[i].id)
        for (let j = 0; j < dataInfo.length; j++) {
            //due date from db
            const dueDate = moment(dataInfo[j].emiDueDate);
            let nextDueDate
            if (dataInfo[j + 1] == undefined) {
                nextDueDate = moment(date);
            } else {
                nextDueDate = moment(dataInfo[j + 1].emiDueDate)
            }
            //current date
            const currentDate = moment(date);
            let daysCount = currentDate.diff(dueDate, 'days');
            let daysCount2 = nextDueDate.diff(dueDate, 'days');
            if (daysCount <= gracePeriodDays) {
                break
            }
            if (daysCount < selectedSlab) {
                daysCount2 = currentDate.diff(dueDate, 'days');
            }
            if (dueDate > currentDate) {
                break
            }
            let penelInterest = Number((((data[i].outstandingAmount * penal) / noOfDaysInYear) * daysCount2).toFixed(2))
            let penalAccrual = penelInterest
            let penalOutstanding;
            if (dataInfo[j + 1] != undefined) {
                penalOutstanding = penalAccrual - dataInfo[j + 1].penalPaid
                console.log("update", penalAccrual, dataInfo[j + 1].id)
                await models.customerLoanInterest.update({ penalInterest: penalAccrual, penalAccrual: penalAccrual, penalOutstanding: (penalOutstanding.toFixed(2)) }, { where: { id: dataInfo[j + 1].id } })
            } else {
                penalAccrual = Number(penalAccrual) + Number(dataInfo[dataInfo.length - 1].penalAccrual)
                penalOutstanding = penalAccrual - dataInfo[j].penalPaid
                console.log("update", penalAccrual, dataInfo[j].id)
                await models.customerLoanInterest.update({ penalInterest: penalAccrual, penalAccrual: penalAccrual, penalOutstanding: (penalOutstanding.toFixed(2)) }, { where: { id: dataInfo[j].id } })
            }
        }

        //add penal next code

        let transaction = []
        for (let j = 0; j < dataInfo.length; j++) {

            let detail = {}
            const currentDate = moment(date);
            const dueDate = moment(dataInfo[j].emiDueDate);
            if (dataInfo[j + 1] == undefined) {
                break;
            }
            const nextDueDate = moment(dataInfo[j + 1].emiDueDate)
            let daysCount = currentDate.diff(dueDate, 'days');
            let daysCount2 = nextDueDate.diff(dueDate, 'days');
            if (daysCount < selectedSlab) {
                // daysCount2 = currentDate.diff(dueDate, 'days');
                break;
            }
            if (dueDate > currentDate) {
                break
            }

            let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: data[i].masterLoanId, loanId: data[i].id, loanInterestId: dataInfo[j + 1].id, credit: 0.00, isPenalInterest: true } });
            let penelInterest
            if (!check.isEmpty(checkDebitEntry)) {
                penelInterest = Number((((data[i].outstandingAmount * penal) / noOfDaysInYear) * daysCount2).toFixed(2))
                let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                let totalDebitedAmount = _.sum(debitedAmount);
                penelInterest = penelInterest - totalDebitedAmount;
            } else {
                penelInterest = Number((((data[i].outstandingAmount * penal) / noOfDaysInYear) * daysCount2).toFixed(2))
            }

            detail.masterLoanId = data[i].masterLoanId
            detail.loanId = data[0].id
            detail.loanInterestId = dataInfo[j + 1].id
            detail.debit = penelInterest
            detail.description = `penal interest`
            detail.isPenalInterest = true
            transaction.push(detail)
            detail = {}

        }
        if (transaction.length != 0) {
            await models.customerTransactionDetail.bulkCreate(transaction);
        }
        //add penal next code

    }
}


let penalInterestCalculationForSelectedLoanWithOutT = async (date, masterLaonId) => {
    let info = await calculationDataOneLoan(masterLaonId);
    let data = info.loanInfo
    let penalData = []
    let filterData = []
    let transactionPenal = []

    let { gracePeriodDays, noOfDaysInYear } = info
    for (let i = 0; i < data.length; i++) {
        let penal = (data[i].penalInterest / 100)
        let selectedSlab = data[i].selectedSlab
        let dataInfo = await getInterestTableOfSingleLoan(data[i].id)
        for (let j = 0; j < dataInfo.length; j++) {

            let penalObject = {}
            //due date from db
            const dueDate = moment(dataInfo[j].emiDueDate);
            let nextDueDate
            if (dataInfo[j + 1] == undefined) {
                nextDueDate = moment(date);
            } else {
                nextDueDate = moment(dataInfo[j + 1].emiDueDate)
            }
            //current date
            const currentDate = moment(date);
            let daysCount = currentDate.diff(dueDate, 'days');
            let daysCount2 = nextDueDate.diff(dueDate, 'days');
            if (daysCount <= Number(gracePeriodDays)) {
                break
            }
            if (daysCount < Number(selectedSlab)) {
                daysCount2 = currentDate.diff(dueDate, 'days');
            }
            if (dueDate > currentDate) {
                break
            }
            let penelInterest = Number((((data[i].outstandingAmount * penal) / noOfDaysInYear) * daysCount2).toFixed(2))
            let penalAccrual = penelInterest
            let penalOutstanding;
            if (dataInfo[j + 1] != undefined) {
                penalOutstanding = penalAccrual - dataInfo[j + 1].penalPaid
                // console.log("update", penalAccrual, dataInfo[j + 1].id)
                // await models.customerLoanInterest.update({ penalInterest: penalAccrual, penalAccrual: penalAccrual, penalOutstanding: penalOutstanding }, { where: { id: dataInfo[j + 1].id } })
                penalObject.id = dataInfo[j + 1].id
                penalObject.penalInterest = penalAccrual
                penalObject.penalAccrual = penalAccrual
                penalObject.penalOutstanding = (penalOutstanding).toFixed(2)
                penalData.push(penalObject)

            } else {
                penalAccrual = Number(penalAccrual) + Number(dataInfo[dataInfo.length - 1].penalAccrual)
                penalOutstanding = penalAccrual - dataInfo[j].penalPaid
                // console.log("update", penalAccrual, dataInfo[j].id)
                // await models.customerLoanInterest.update({ penalInterest: penalAccrual, penalAccrual: penalAccrual, penalOutstanding: penalOutstanding }, { where: { id: dataInfo[j].id } })
                penalObject.id = dataInfo[j].id
                penalObject.penalInterest = penalAccrual
                penalObject.penalAccrual = penalAccrual
                penalObject.penalOutstanding = (penalOutstanding).toFixed(2)
                penalData.push(penalObject)

            }
        }

        // filterData.push(dataInfo)
        filterData = [...dataInfo, ...filterData]

        //add penal next code

        for (let j = 0; j < dataInfo.length; j++) {

            let detail = {}
            const currentDate = moment(date);
            const dueDate = moment(dataInfo[j].emiDueDate);
            if (dataInfo[j + 1] == undefined) {
                break;
            }
            const nextDueDate = moment(dataInfo[j + 1].emiDueDate)
            let daysCount = currentDate.diff(dueDate, 'days');
            let daysCount2 = nextDueDate.diff(dueDate, 'days');
            if (daysCount < selectedSlab) {
                // daysCount2 = currentDate.diff(dueDate, 'days');
                break;
            }
            if (dueDate > currentDate) {
                break
            }

            let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: data[i].masterLoanId, loanId: data[i].id, loanInterestId: dataInfo[j + 1].id, credit: 0.00, isPenalInterest: true } });
            let penelInterest
            if (!check.isEmpty(checkDebitEntry)) {
                penelInterest = Number((((data[i].outstandingAmount * penal) / noOfDaysInYear) * daysCount2).toFixed(2))
                let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                let totalDebitedAmount = _.sum(debitedAmount);
                penelInterest = penelInterest - totalDebitedAmount;
            } else {
                penelInterest = Number((((data[i].outstandingAmount * penal) / noOfDaysInYear) * daysCount2).toFixed(2))
            }

            detail.masterLoanId = data[i].masterLoanId
            detail.loanId = data[0].id
            detail.loanInterestId = dataInfo[j + 1].id
            detail.debit = penelInterest
            detail.description = `penal interest`
            detail.isPenalInterest = true
            transactionPenal.push(detail)
            detail = {}

        }

        //add penal next code

    }

    let temp = filterData.map(ele => ele.dataValues)
    filterData = []
    filterData = temp;

    for (let i = 0; i < filterData.length; i++) {
        const allPenal = filterData[i];
        allPenal.penalAccrual = 0
        allPenal.penalInterest = 0
        allPenal.penalOutstanding = 0
        for (let j = 0; j < penalData.length; j++) {
            const rollBackPenal = penalData[j];
            if (allPenal.id == rollBackPenal.id) {
                filterData.splice(i, 1)
                i = 0;
                break;
            }
        }
    }
    penalData = [...filterData, ...penalData]


    return { penalData, transactionPenal }
}



let intrestCalculationForSelectedLoanWithOutT = async (date, masterLoanId, securedInterest, unsecuredInterest, selectedSlab) => {
    let data = await calculationDataOneLoan(masterLoanId);
    let loanInfo = data.loanInfo;
    let currentDate = moment(date);
    let noOfDays = 0;

    let transactionData = []
    let interestDataObject = []
    let customerLoanData = []

    await sequelize.transaction(async t => {
        for (let index = 0; index < loanInfo.length; index++) {
            let loan = loanInfo[index];
            let allInterestTable = await getAllInterest(loan.id);
            let lastPaidEmi = await checkPaidInterest(loan.id, loan.masterLoanId);
            let firstInterestToPay = await getFirstInterestToPay(loan.id, loan.masterLoanId);
            let loanStartDate;

            let transactionObject = {}
            let interestObject = {}
            let customerLoanObject = {}

            if (!lastPaidEmi) {
                loanStartDate = moment(loan.masterLoan.loanStartDate);
                noOfDays = currentDate.diff(loanStartDate, 'days');
            } else {
                loanStartDate = moment(lastPaidEmi.emiDueDate);
                noOfDays = currentDate.diff(loanStartDate, 'days');
            }
            noOfDays += 1;
            //scenario 2 slab changed
            let interest
            if (securedInterest || unsecuredInterest) {
                var currentInterestRate
                if (index % 2 == 0) {
                    currentInterestRate = securedInterest
                } else {
                    currentInterestRate = unsecuredInterest

                }
                interest = await newSlabRateInterestCalcultaion(loan.outstandingAmount, currentInterestRate, loan.selectedSlab, loan.masterLoan.tenure);
            } else {
                interest = await newSlabRateInterestCalcultaion(loan.outstandingAmount, loan.currentInterestRate, loan.selectedSlab, loan.masterLoan.tenure);
            }
            let stepUpSlab = await getStepUpslab(loan.id, noOfDays);
            let allInterest = await getAllNotPaidInterest(loan.id)//get all interest
            let interestLessThanDate = await getAllInterestLessThanDate(loan.id, date);
            let interestGreaterThanDate = await getAllInterestGreaterThanDate(loan.id, date);
            //update interestAccrual & interest amount //here to debit amount
            for (const interestData of interestLessThanDate) {
                let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, credit: 0.00, isPenalInterest: false } });
                transactionObject = {}
                if (checkDebitEntry.length == 0) {
                    // let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: interest.amount, description: `Net interest due (after rebate) ${interestData.emiDueDate}` }, { transaction: t });
                    //
                    transactionObject.masterLoanId = loan.masterLoanId
                    transactionObject.loanId = loan.id
                    transactionObject.loanUniqueId = loan.loanUniqueId
                    transactionObject.loanInterestId = interestData.id
                    transactionObject.debit = interest.amount
                    transactionObject.description = `Net interest due (after rebate) ${moment(interestData.emiDueDate).format('DD/MM/YYYY')}`
                    transactionObject.paymentDate = moment()
                    transactionData.push(transactionObject)
                    //

                    // await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                } else {
                    let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                    let totalDebitedAmount = _.sum(debitedAmount);
                    let newDebitAmount = interest.amount - totalDebitedAmount;
                    if (newDebitAmount > 0) {
                        // let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: newDebitAmount, description: `stepUpInterest ${interestData.emiDueDate}` }, { transaction: t });
                        //
                        transactionObject.masterLoanId = loan.masterLoanId
                        transactionObject.loanId = loan.id
                        transactionObject.loanUniqueId = loan.loanUniqueId
                        transactionObject.loanInterestId = interestData.id
                        transactionObject.debit = newDebitAmount
                        transactionObject.description = `stepUpInterest ${moment(interestData.emiDueDate).format('DD/MM/YYYY')}`
                        transactionObject.paymentDate = moment()
                        transactionData.push(transactionObject)
                        //

                        // await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                    } else if (newDebitAmount < 0) {
                        //
                        transactionObject.masterLoanId = loan.masterLoanId
                        transactionObject.loanId = loan.id
                        transactionObject.loanUniqueId = loan.loanUniqueId
                        transactionObject.loanInterestId = interestData.id
                        transactionObject.credit = Math.abs(newDebitAmount)
                        transactionObject.description = `stepDownInterest ${moment(interestData.emiDueDate).format('DD/MM/YYYY')}`
                        transactionObject.paymentDate = moment()
                        transactionData.push(transactionObject)
                        //
                    }
                }
                let outstandingInterest = interest.amount - interestData.paidAmount;
                let interestAccrual = interest.amount - interestData.paidAmount;
                // await models.customerLoanInterest.update({ interestAmount: interest.amount, totalInterestAccrual: interest.amount, outstandingInterest, interestAccrual, interestRate: stepUpSlab.interestRate }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                interestObject = {}

                //
                interestObject.interestAmount = interest.amount
                interestObject.totalInterestAccrual = interest.amount
                interestObject.outstandingInterest = outstandingInterest
                interestObject.interestAccrual = interestAccrual
                interestObject.interestRate = currentInterestRate
                interestObject.id = interestData.id
                interestDataObject.push(interestObject)
                //
            }
            interestObject = {}
            if (allInterest.length != interestLessThanDate.length) {
                let pendingNoOfDays = noOfDays - (interestLessThanDate.length * loan.selectedSlab);
                if (pendingNoOfDays > 0) {
                    let oneDayInterest = loan.currentInterestRate / 30;
                    let oneDayAmount = loan.outstandingAmount * (oneDayInterest / 100);
                    let pendingDaysAmount = pendingNoOfDays * oneDayAmount;
                    let nextInterest = await getPendingNoOfDaysInterest(loan.id, date);
                    if (nextInterest) {
                        let amount;
                        if (pendingDaysAmount > Number(nextInterest.paidAmount)) {
                            amount = pendingDaysAmount - nextInterest.paidAmount;
                        } else {
                            amount = nextInterest.paidAmount - pendingDaysAmount;
                        }
                        // await models.customerLoanInterest.update({ totalInterestAccrual: pendingDaysAmount, interestAccrual: amount, interestRate: loan.currentInterestRate, outstandingInterest: amount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });

                        //
                        interestObject.totalInterestAccrual = pendingDaysAmount
                        interestObject.interestAccrual = amount
                        interestObject.interestRate = currentInterestRate
                        interestObject.outstandingInterest = amount
                        interestObject.id = nextInterest.id
                        interestDataObject.push(interestObject)
                        //
                    }
                }
            }
            interestObject = {}
            //calculate extra interest
            if (interestGreaterThanDate.length == 0) {
                let pendingNoOfDays = noOfDays - (interestLessThanDate.length * loan.selectedSlab);
                if (pendingNoOfDays > 0) {
                    let oneDayInterest = loan.currentInterestRate / 30;
                    let oneDayAmount = loan.outstandingAmount * (oneDayInterest / 100);
                    let pendingDaysAmount = pendingNoOfDays * oneDayAmount;
                    let extraInterest = await getExtraInterest(loan.id);
                    //rebate
                    let oneDayInterestRebate = loan.rebateInterestRate / 30;
                    let oneDayAmountRebate = loan.outstandingAmount * (oneDayInterestRebate / 100);
                    let highestInterestAmount = pendingNoOfDays * oneDayAmountRebate;
                    let rebateAmount = highestInterestAmount - pendingDaysAmount;
                    //
                    if (!extraInterest) {
                        let amount = pendingDaysAmount;
                        // await models.customerLoanInterest.create({ loanId: loan.id, masterLoanId: loan.masterLoanId, emiStartDate: date, emiDueDate: date, emiEndDate: date, interestRate: loan.currentInterestRate, interestAmount: amount, interestAccrual: amount, totalInterestAccrual: amount, outstandingInterest: amount, isExtraDaysInterest: true }, { transaction: t });

                        //
                        interestObject.loanId = loan.id
                        interestObject.masterLoanId = loan.masterLoanId
                        interestObject.emiStartDate = date
                        interestObject.emiDueDate = date
                        interestObject.emiEndDate = date
                        interestObject.interestRate = currentInterestRate
                        interestObject.interestAmount = amount
                        interestObject.interestAccrual = amount
                        interestObject.totalInterestAccrual = amount
                        interestObject.outstandingInterest = amount
                        interestObject.isExtraDaysInterest = true
                        interestObject.rebateAmount = rebateAmount
                        interestObject.highestInterestAmount = highestInterestAmount
                        interestObject.rebateInterestRate = loan.rebateInterestRate
                        interestDataObject.push(interestObject)
                        //
                    } else {
                        let amount = pendingDaysAmount;
                        let interestAccrual = amount - extraInterest.paidAmount;
                        let outstandingInterest = amount - extraInterest.paidAmount;
                        if (amount > Number(extraInterest.paidAmount)) {
                            interestAccrual = amount - extraInterest.paidAmount;
                            outstandingInterest = amount - extraInterest.paidAmount;
                        } else {
                            interestAccrual = extraInterest.paidAmount - amount;
                            outstandingInterest = extraInterest.paidAmount - amount;
                        }
                        // await models.customerLoanInterest.update({ interestAmount: amount, emiDueDate: date, emiEndDate: date, interestAccrual, totalInterestAccrual: amount, outstandingInterest, interestRate: loan.currentInterestRate }, { where: { id: extraInterest.id }, transaction: t });

                        //
                        interestObject.interestAmount = amount
                        interestObject.emiDueDate = date
                        interestObject.emiEndDate = date
                        interestObject.interestAccrual = interestAccrual
                        interestObject.totalInterestAccrual = amount
                        interestObject.outstandingInterest = outstandingInterest
                        interestObject.interestRate = loan.currentInterestRate
                        interestObject.id = extraInterest.id
                        interestObject.rebateAmount = rebateAmount
                        interestObject.highestInterestAmount = highestInterestAmount
                        interestDataObject.push(interestObject)
                        //
                    }
                }
            }
            //update all interest amount
            for (const interestData of allInterest) {
                let outstandingInterest = interest.amount - interestData.paidAmount;
                let rebateAmount = interestData.highestInterestAmount - interest.amount;
                // await models.customerLoanInterest.update({ interestAmount: interest.amount, outstandingInterest, interestRate: loan.currentInterestRate }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                if (outstandingInterest < 0) {
                    outstandingInterest = 0
                }
                interestObject = {}
                //
                interestObject.interestAmount = interest.amount
                interestObject.outstandingInterest = outstandingInterest
                interestObject.interestRate = currentInterestRate
                interestObject.id = interestData.id
                interestObject.rebateAmount = rebateAmount
                interestDataObject.push(interestObject)
                //
            }
            interestObject = {}
            //update last interest if changed
            if (!Number.isInteger(interest.length)) {
                const noOfMonths = (((loan.masterLoan.tenure * 30) - ((allInterestTable.length - 1) * loan.selectedSlab)) / 30)
                let oneMonthAmount = interest.amount / (loan.selectedSlab / 30);
                let amount = (oneMonthAmount * noOfMonths).toFixed(2);
                let lastInterest = await getLastInterest(loan.id, loan.masterLoanId)
                let rebateAmount = lastInterest.highestInterestAmount - amount;
                let outstandingInterest = amount - lastInterest.paidAmount;
                // await models.customerLoanInterest.update({ interestAmount: amount, outstandingInterest, interestRate: loan.currentInterestRate }, { where: { id: lastInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                if (outstandingInterest < 0) {
                    outstandingInterest = 0
                }
                //
                interestObject.interestAmount = amount
                interestObject.outstandingInterest = outstandingInterest
                interestObject.interestRate = currentInterestRate
                interestObject.id = lastInterest.id
                interestObject.rebateAmount = rebateAmount
                interestDataObject.push(interestObject)
                //
            }
            //update current slab in customer loan table
            // await models.customerLoan.update({ currentInterestRate: loan.currentInterestRate, currentSlab: stepUpSlab.days }, { where: { id: loan.id }, transaction: t });
            //    Commented /////////////////////////////////////////////
            // customerLoanObject = {}

            // //
            // customerLoanObject.currentInterestRate = loan.currentInterestRate
            // customerLoanObject.currentSlab = stepUpSlab.days
            // customerLoanObject.id = loan.id
            // customerLoanData.push(customerLoanObject)
            ////////////////////////////////////////////////
        }
    });
    return { noOfDays, transactionData, interestDataObject, customerLoanData };

}


let customerNameNumberLoanId = async (masterLoanId) => {

    let messageLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        order: [
            [models.customerLoan, 'id', 'asc']
        ],
        include: [
            {
                model: models.customerLoan,
                as: 'customerLoan',
                attributes: ['loanUniqueId']
            },
            {
                model: models.customer,
                as: 'customer',
                attributes: ['firstName', 'lastName', 'mobileNumber', 'id']
            }
        ]
    })
    let customerName = `${messageLoan.customer.firstName} ${messageLoan.customer.lastName}`
    let sendLoanUniqueId;

    if (messageLoan.isUnsecuredSchemeApplied) {
        sendLoanUniqueId = `${messageLoan.customerLoan[0].loanUniqueId}, ${messageLoan.customerLoan[1].loanUniqueId}`
    } else {
        sendLoanUniqueId = `${messageLoan.customerLoan[0].loanUniqueId}`
    }
    return {
        mobileNumber: messageLoan.customer.mobileNumber,
        customerName: customerName,
        sendLoanUniqueId: sendLoanUniqueId
    }
}
let getSecuredScheme = async (securedSchemeId) => {
    let securedScheme = await models.scheme.findOne({
        where: { id: securedSchemeId },
        // attributes: ['id'],
        order: [
            [models.schemeInterest, 'days', 'asc']
        ],
        include: [{
            model: models.schemeInterest,
            as: 'schemeInterest',
            attributes: ['days', 'interestRate']
        }, {
            model: models.scheme,
            as: 'unsecuredScheme'
        }]
    })
    return securedScheme
}

let getAllPartAndFullReleaseData = async (masterLoanId, ornamentId) => {
    let whereSelectedOrmenemts = { id: { [Op.in]: ornamentId }, isActive: true, isReleased: false };
    let whereOtherOrmenemts = { id: { [Op.notIn]: ornamentId }, isActive: true, isReleased: false };
    let loanData = await getLoanDetails(masterLoanId);
    let amount = await getCustomerInterestAmount(masterLoanId);
    let requestedOrnaments = await ornementsDetails(masterLoanId, whereSelectedOrmenemts);
    let otherOrnaments = await ornementsDetails(masterLoanId, whereOtherOrmenemts);
    let allOrnaments = await allOrnamentsDetails(masterLoanId);
    let ornamentWeight = await getornamentsWeightInfo(requestedOrnaments, otherOrnaments, loanData, allOrnaments);
    let loanInfo = await getornamentLoanInfo(masterLoanId, ornamentWeight, amount);
    return { ornamentWeight, loanInfo, amount }
}

let ornementsDetails = async (masterLoanId, whereBlock) => {
    let ornaments = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['customerId', 'masterLoanUniqueId', 'finalLoanAmount', 'tenure', 'loanStartDate', 'loanEndDate'],
        include: [{
            model: models.customerLoanOrnamentsDetail,
            as: 'loanOrnamentsDetail',
            where: whereBlock,
            include: [
                {
                    model: models.ornamentType,
                    as: "ornamentType",
                    attributes: ['name', 'id'],
                },
                {
                    model: models.packet,
                }
            ]
        }]
    });
    return ornaments;
}

let allOrnamentsDetails = async (masterLoanId) => {
    let ornaments = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['customerId', 'masterLoanUniqueId', 'finalLoanAmount', 'tenure', 'loanStartDate', 'loanEndDate'],
        include: [{
            model: models.customerLoanOrnamentsDetail,
            as: 'loanOrnamentsDetail',
            where: { isActive: true, isReleased: false },
            include: [
                {
                    model: models.ornamentType,
                    as: "ornamentType",
                    attributes: ['name', 'id'],
                },
                {
                    model: models.packet,
                }
            ]
        }]
    });
    return ornaments;
}

let getornamentsWeightInfo = async(requestedOrnaments, otherOrnaments, loanData, allOrnaments) => {
    let ornamentsWeightInfo = {
        releaseGrossWeight: 0,
        releaseDeductionWeight: 0,
        releaseNetWeight: 0,
        remainingGrossWeight: 0,
        remainingDeductionWeight: 0,
        remainingNetWeight: 0,
        releaseAmount: 0,
        currentLtv: 0,
        previousLtv: 0,
        currentOutstandingAmount: 0,
        allOrnamentsGrossWeight: 0,
        allOrnamentsDeductionWeight: 0,
        allOrnamentsNetWeight: 0,
        totalOfReleaseOrnaments: 0,
        totalOfRemainingOrnaments: 0,
        previousOutstandingAmount: 0,
        remainingOrnamentAmount: 0,//remning ornament
        newLoanAmount: 0,//new loan amount
    }
    if (requestedOrnaments || allOrnaments) {
        let securedLoanRpg = loanData.customerLoan[0].scheme.rpg;
        let unSecuredLoanRpg = 0;
        if (loanData.customerLoan.length > 1) {
            unSecuredLoanRpg = loanData.customerLoan[1].scheme.rpg;
        }
        // let globalSettings = await getGlobalSetting();
        // let goldRate = await getGoldRate();
        ornamentsWeightInfo.currentLtv = Number(securedLoanRpg) + Number(unSecuredLoanRpg);
        ornamentsWeightInfo.previousLtv = requestedOrnaments.loanOrnamentsDetail[0].currentLtvAmount;
        ornamentsWeightInfo.previousOutstandingAmount = loanData.outstandingAmount;

        //current outstanding amount
        if (allOrnaments != null) {
            for (const ornaments of allOrnaments.loanOrnamentsDetail) {
                ornamentsWeightInfo.allOrnamentsGrossWeight = ornamentsWeightInfo.allOrnamentsGrossWeight + parseFloat(ornaments.grossWeight);
                ornamentsWeightInfo.allOrnamentsDeductionWeight = ornamentsWeightInfo.allOrnamentsDeductionWeight + parseFloat(ornaments.deductionWeight);
                ornamentsWeightInfo.allOrnamentsNetWeight = ornamentsWeightInfo.allOrnamentsNetWeight + parseFloat(ornaments.netWeight);
                let ltvAmount = ornamentsWeightInfo.currentLtv * (ornaments.ltvPercent / 100)
                ornamentsWeightInfo.currentOutstandingAmount = ornamentsWeightInfo.currentOutstandingAmount + (ltvAmount * parseFloat(ornaments.netWeight));
            }
        }


        if (requestedOrnaments != null) {
            for (const ornaments of requestedOrnaments.loanOrnamentsDetail) {
                ornamentsWeightInfo.releaseGrossWeight = ornamentsWeightInfo.releaseGrossWeight + parseFloat(ornaments.grossWeight);
                ornamentsWeightInfo.releaseDeductionWeight = ornamentsWeightInfo.releaseDeductionWeight + parseFloat(ornaments.deductionWeight);
                ornamentsWeightInfo.releaseNetWeight = ornamentsWeightInfo.releaseNetWeight + parseFloat(ornaments.netWeight);
                let ltvAmount = ornamentsWeightInfo.currentLtv * (ornaments.ltvPercent / 100)
                ornamentsWeightInfo.totalOfReleaseOrnaments = ornamentsWeightInfo.totalOfReleaseOrnaments + (ltvAmount * parseFloat(ornaments.netWeight));
            }
        }

        if (otherOrnaments != null) {
            for (const ornaments of otherOrnaments.loanOrnamentsDetail) {
                ornamentsWeightInfo.remainingGrossWeight = ornamentsWeightInfo.remainingGrossWeight + parseFloat(ornaments.grossWeight);
                ornamentsWeightInfo.remainingDeductionWeight = ornamentsWeightInfo.remainingDeductionWeight + parseFloat(ornaments.deductionWeight);
                ornamentsWeightInfo.remainingNetWeight = ornamentsWeightInfo.remainingNetWeight + parseFloat(ornaments.netWeight);
                let ltvAmount = ornamentsWeightInfo.currentLtv * (ornaments.ltvPercent / 100)
                ornamentsWeightInfo.totalOfRemainingOrnaments = ornamentsWeightInfo.totalOfRemainingOrnaments + (ltvAmount * parseFloat(ornaments.netWeight));
            }
        }


        ornamentsWeightInfo.currentOutstandingAmount = Math.round(ornamentsWeightInfo.currentOutstandingAmount);
        ornamentsWeightInfo.totalOfReleaseOrnaments = Math.round(ornamentsWeightInfo.totalOfReleaseOrnaments);
        ornamentsWeightInfo.totalOfRemainingOrnaments = Math.round(ornamentsWeightInfo.totalOfRemainingOrnaments);
        ornamentsWeightInfo.releaseAmount = ornamentsWeightInfo.currentOutstandingAmount - ornamentsWeightInfo.previousOutstandingAmount - ornamentsWeightInfo.totalOfReleaseOrnaments;
        if (ornamentsWeightInfo.releaseAmount > 0) {
            ornamentsWeightInfo.releaseAmount = 0
        } else {
            ornamentsWeightInfo.releaseAmount = Math.round(Math.abs(ornamentsWeightInfo.releaseAmount));
        }
        ornamentsWeightInfo.remainingOrnamentAmount = Math.round(ornamentsWeightInfo.currentOutstandingAmount - ornamentsWeightInfo.previousOutstandingAmount - ornamentsWeightInfo.totalOfRemainingOrnaments);
        ornamentsWeightInfo.newLoanAmount = ornamentsWeightInfo.currentOutstandingAmount - ornamentsWeightInfo.previousOutstandingAmount - ornamentsWeightInfo.remainingOrnamentAmount;
    }
    return ornamentsWeightInfo;
}

let getornamentLoanInfo = async(masterLoanId, ornamentWeight, amount)=> {
    let loanData = await models.customerLoan.findAll({ where: { masterLoanId }, attributes: ['loanUniqueId', 'loanAmount'] });
    let loanAmountData = await models.customerLoanMaster.findOne({ where: { id: masterLoanId }, attributes: ['finalLoanAmount', 'outstandingAmount'] });
    let loanDetails = {
        loanData,
        finalLoanAmount: 0,
        interestAmount: 0,
        penalInterest: 0,
        totalPayableAmount: 0,
        securedInterest: 0,
        securedPenalInterest: 0,
        unsecuredInterest: 0,
        unsecuredPenalInterest: 0
    }
    loanDetails.interestAmount = amount.secured.interest;
    loanDetails.penalInterest = amount.secured.penalInterest;
    loanDetails.securedInterest = amount.secured.interest;
    loanDetails.securedPenalInterest = amount.secured.penalInterest;
    if (amount.unsecured) {
        loanDetails.interestAmount = loanDetails.interestAmount + amount.unsecured.interest;
        loanDetails.penalInterest = loanDetails.penalInterest + amount.unsecured.penalInterest;
        loanDetails.unsecuredInterest = amount.unsecured.interest;
        loanDetails.unsecuredPenalInterest = amount.unsecured.penalInterest;
    }
    //calculate value here
    loanDetails.totalPayableAmount = Number((ornamentWeight.releaseAmount + loanDetails.penalInterest + loanDetails.interestAmount).toFixed(2));
    loanDetails.interestAmount = Number(loanDetails.interestAmount.toFixed(2));
    loanDetails.penalInterest = Number(loanDetails.penalInterest.toFixed(2));
    loanDetails.finalLoanAmount = loanAmountData.finalLoanAmount;
    return loanDetails;
}

module.exports = {
    getGlobalSetting: getGlobalSetting,
    getAllCustomerLoanId: getAllCustomerLoanId,
    getLoanDetails: getLoanDetails,
    getSchemeDetails: getSchemeDetails,
    interestAmountCalculation: interestAmountCalculation,
    getCustomerLoanDetails: getCustomerLoanDetails,
    getAllDetailsOfCustomerLoan: getAllDetailsOfCustomerLoan,
    getCustomerInterestAmount: getCustomerInterestAmount,
    getInterestTableOfSingleLoan: getInterestTableOfSingleLoan,
    calculationData: calculationData,
    checkPaidInterest: checkPaidInterest,
    getInterestOfSelectedMonth: getInterestOfSelectedMonth,
    calculation: calculation,
    getFirstInterest: getFirstInterest,
    newSlabRateInterestCalcultaion: newSlabRateInterestCalcultaion,
    getStepUpslab: getStepUpslab,
    getLastInterest: getLastInterest,
    getAllNotPaidInterest: getAllNotPaidInterest,
    getAllInterestLessThanDate: getAllInterestLessThanDate,
    getPendingNoOfDaysInterest: getPendingNoOfDaysInterest,
    mergeInterestTable: mergeInterestTable,
    getCustomerLoanId: getCustomerLoanId,
    calculationDataOneLoan: calculationDataOneLoan,
    intrestCalculationForSelectedLoan: intrestCalculationForSelectedLoan,
    payableAmountForLoan: payableAmountForLoan,
    customerLoanDetailsByMasterLoanDetails: customerLoanDetailsByMasterLoanDetails,
    allInterestPayment: allInterestPayment,
    penalInterestPayment: penalInterestPayment,
    updateInterestAftertOutstandingAmount: updateInterestAftertOutstandingAmount,
    getFirstInterestToPay: getFirstInterestToPay,
    getAllPaidInterest: getAllPaidInterest,
    getAllInterestGreaterThanDate: getAllInterestGreaterThanDate,
    getExtraInterest: getExtraInterest,
    getSingleLoanDetail: getSingleLoanDetail,
    getAmountLoanSplitUpData: getAmountLoanSplitUpData,
    getTransactionPrincipalAmount: getTransactionPrincipalAmount,
    nextDueDateInterest: nextDueDateInterest,
    getSingleMasterLoanDetail: getSingleMasterLoanDetail,
    splitAmountIntoSecuredAndUnsecured: splitAmountIntoSecuredAndUnsecured,
    penalInterestCalculationForSelectedLoan: penalInterestCalculationForSelectedLoan,
    stepDown: stepDown,
    intrestCalculationForSelectedLoanWithOutT: intrestCalculationForSelectedLoanWithOutT,
    penalInterestCalculationForSelectedLoanWithOutT: penalInterestCalculationForSelectedLoanWithOutT,
    customerNameNumberLoanId: customerNameNumberLoanId,
    getAllInterest: getAllInterest,
    getSecuredScheme: getSecuredScheme,
    interestSplit: interestSplit,
    getAllPaidInterestForCalculation: getAllPaidInterestForCalculation,
    getAllPartAndFullReleaseData: getAllPartAndFullReleaseData,
    ornementsDetails:ornementsDetails,
    allOrnamentsDetails:allOrnamentsDetails,
    getornamentsWeightInfo:getornamentsWeightInfo,
    getornamentLoanInfo:getornamentLoanInfo,
    calculationDataForReleasedLoan:calculationDataForReleasedLoan,
    getAllPaidPartialyPaidInterest:getAllPaidPartialyPaidInterest
}