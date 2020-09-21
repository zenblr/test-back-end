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
    console.log(customerLoanId)
    for (const masterLoanData of masterLona) {
        await masterLoanData.customerLoan.map((data) => { customerLoanId.push(data.id) });
    }
    return customerLoanId
}

let getAllDetailsOfCustomerLoan = async (customerLoanId) => {
    let loanData = await models.customerLoan.findOne({
        where: { id: customerLoanId },
        order: [
            ['id', 'asc'],
            [models.customerLoanInterest, 'id', 'asc'],
        ],
        attributes: ['id', 'masterLoanId', 'loanUniqueId', 'selectedSlab', 'loanAmount', 'outstandingAmount', 'currentSlab', 'currentInterestRate', 'penalInterestLastReceivedDate', 'penalInterest', 'loanType'],
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
        attributes: ['id', 'paidAmount']
    });
    return lastInterest;
}

let getAllNotPaidInterest = async (loanId) => {
    let allNotPaidInterest = await models.customerLoanInterest.findAll({
        where: { loanId: loanId, emiStatus: { [Op.notIn]: ['paid'] }, isExtraDaysInterest: false },
        attributes: ['id', 'interestAmount', 'paidAmount', 'emiDueDate']
    });
    return allNotPaidInterest;
}

let getAllInterestLessThanDate = async (loanId, date) => {
    let allInterestLessThanDate = await models.customerLoanInterest.findAll({
        where: { loanId: loanId, emiDueDate: { [Op.lte]: date, }, emiStatus: { [Op.notIn]: ['paid'] }, isExtraDaysInterest: false },
        attributes: ['id', 'interestAmount', 'paidAmount', 'emiDueDate']
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
            data.penalInterest = Number(securedTable[i].penalInterest) + Number(unsecuredTable[i].penalInterest)
            if (securedTable[i].emiStatus == 'partially paid' || unsecuredTable[i].emiStatus == 'partially paid') {
                data.emiStatus = 'partially paid'
            } else if (securedTable[i].emiStatus == 'pending' || unsecuredTable[i].emiStatus == 'pending') { }
        } else {
            data.emiReceivedDate = securedTable[i].emiReceivedDate
            data.interestAmount = (Number(securedTable[i].interestAmount)).toFixed(2)
            data.balanceAmount = (Number(securedTable[i].outstandingInterest)).toFixed(2)
            data.paidAmount = (Number(securedTable[i].paidAmount)).toFixed(2)
            data.penalInterest = securedTable[i].penalInterest
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
    let data = await calculationDataOneLoan(masterLoanId);
    let loanInfo = data.loanInfo;
    let currentDate = moment(date);
    let noOfDays = 0;
    await sequelize.transaction(async t => {
        for (const loan of loanInfo) {
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
            if (noOfDays > loan.currentSlab && checkDueDateForSlab) {
                //scenario 2 slab changed
                let stepUpSlab = await getStepUpslab(loan.id, noOfDays);
                let interest = await newSlabRateInterestCalcultaion(loan.outstandingAmount, stepUpSlab.interestRate, loan.selectedSlab, loan.masterLoan.tenure);
                let allInterest = await getAllNotPaidInterest(loan.id)//get all interest
                let interestLessThanDate = await getAllInterestLessThanDate(loan.id, date);
                let interestGreaterThanDate = await getAllInterestGreaterThanDate(loan.id, date);
                //update interestAccrual & interest amount //here to debit amount
                for (const interestData of interestLessThanDate) {
                    let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, description: { [Op.in]: [`interest due ${interestData.emiDueDate}`, `stepUpInterest ${interestData.emiDueDate}`] } } });
                    if (checkDebitEntry.length == 0) {
                        let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: interest.amount, description: `interest due ${interestData.emiDueDate}` }, { transaction: t });
                        await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                    } else {
                        let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                        let totalDebitedAmount = _.sum(debitedAmount);
                        let newDebitAmount = interest.amount - totalDebitedAmount;
                        if (newDebitAmount > 0) {
                            let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: newDebitAmount, description: `stepUpInterest ${interestData.emiDueDate}` }, { transaction: t });
                            await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
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
                            let amount = pendingDaysAmount - nextInterest.paidAmount;
                            await models.customerLoanInterest.update({ totalInterestAccrual: pendingDaysAmount, interestAccrual: amount, interestRate: stepUpSlab.interestRate, outstandingInterest: amount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
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
                        if (!extraInterest) {
                            let amount = pendingDaysAmount;
                            await models.customerLoanInterest.create({ loanId: loan.id, masterLoanId: loan.masterLoanId, emiStartDate: date, emiDueDate: date, emiEndDate: date, interestRate: stepUpSlab.interestRate, interestAmount: amount, interestAccrual: amount, totalInterestAccrual: amount, outstandingInterest: amount, isExtraDaysInterest: true }, { transaction: t });
                        } else {
                            let amount = pendingDaysAmount;
                            let interestAccrual = amount - extraInterest.paidAmount;
                            let outstandingInterest = amount - extraInterest.paidAmount;
                            await models.customerLoanInterest.update({ interestAmount: amount, emiDueDate: date, emiEndDate: date, interestAccrual, totalInterestAccrual: amount, outstandingInterest, interestRate: stepUpSlab.interestRate }, { where: { id: extraInterest.id }, transaction: t });
                        }
                    }
                }
                //update all interest amount
                for (const interestData of allInterest) {
                    let outstandingInterest = interest.amount - interestData.paidAmount;
                    await models.customerLoanInterest.update({ interestAmount: interest.amount, outstandingInterest, interestRate: stepUpSlab.interestRate }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                }
                //update last interest if changed
                if (!Number.isInteger(interest.length)) {
                    const noOfMonths = (((loan.masterLoan.tenure * 30) - ((interest.length - 1) * loan.selectedSlab)) / 30)
                    let oneMonthAmount = interest.amount / (stepUpSlab.days / 30);
                    let amount = (oneMonthAmount * noOfMonths).toFixed(2);
                    let lastInterest = await getLastInterest(loan.id, loan.masterLoanId)
                    let outstandingInterest = amount - lastInterest.paidAmount;
                    await models.customerLoanInterest.update({ interestAmount: amount, outstandingInterest, interestRate: stepUpSlab.interestRate }, { where: { id: lastInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
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
                            let checkDebitEntry = await models.customerTransactionDetail.findOne({ where: { masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, description: `interest due ${interestData.emiDueDate}` } });
                            if (!checkDebitEntry) {
                                let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: interestData.interestAmount, description: `interest due ${interestData.emiDueDate}` }, { transaction: t });
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
                                let amount = pendingDaysAmount - nextInterest.paidAmount;
                                await models.customerLoanInterest.update({ interestAccrual: amount, totalInterestAccrual: pendingDaysAmount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
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
                                let interestAccrual = amount - extraInterest.paidAmount;
                                let outstandingInterest = amount - extraInterest.paidAmount;
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
            let lastPaidEmi = await checkPaidInterest(loan.id, loan.masterLoanId);
            let loanStartDate;
            if (!lastPaidEmi) {
                loanStartDate = moment(loan.masterLoan.loanStartDate);
                noOfDays = currentDate.diff(loanStartDate, 'days');
            } else {
                loanStartDate = moment(lastPaidEmi.emiDueDate);
                noOfDays = currentDate.diff(loanStartDate, 'days');
            }
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
                let outstandingInterest = interest.amount - interestData.paidAmount;
                await models.customerLoanInterest.update({ interestAmount: interest.amount, outstandingInterest }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
            }
            //update last interest if changed
            if (!Number.isInteger(interest.length)) {
                const noOfMonths = (((loan.masterLoan.tenure * 30) - ((interest.length - 1) * loan.selectedSlab)) / 30)
                let oneMonthAmount = interest.amount / (loan.selectedSlab / 30);
                let amount = (oneMonthAmount * noOfMonths).toFixed(2);
                let lastInterest = await getLastInterest(loan.id, loan.masterLoanId)
                let outstandingInterest = amount - lastInterest.paidAmount;
                await models.customerLoanInterest.update({ interestAmount: amount, outstandingInterest }, { where: { id: lastInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
            }
        }
    });
    return noOfDays;
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

        } else if (pendingSecuredAmount < Number(loanArray[index]['outstandingInterest'])) {

            loanArray[index]['emiStatus'] = "partially paid"
            loanArray[index]['paidAmount'] = Number(loanArray[index]['paidAmount']) + Number(pendingSecuredAmount.toFixed(2))
            transactionData.loanInterestId = loanArray[index]['id']
            transactionData.isExtraDaysInterest = loanArray[index]['isExtraDaysInterest']
            transactionData.interestAmount = loanArray[index]['interestAmount']
            transactionData.penalInterest = loanArray[index]['penalInterest']
            transactionData.emiDueDate = loanArray[index]['emiDueDate']
            transactionData.loanId = loanArray[index]['loanId']
            transactionData.masterLoanId = loanArray[index]['masterLoanId']
            transactionData.credit = pendingSecuredAmount.toFixed(2)
            transactionData.loanUniqueId = loanArray[index]['customerLoan'].loanUniqueId
            transaction.push(transactionData)
            pendingSecuredAmount = (loanArray[index]['outstandingInterest'] - pendingSecuredAmount).toFixed(2)
            loanArray[index]['outstandingInterest'] = loanArray[index]['outstandingInterest'] - loanArray[index]['paidAmount'];
            pendingSecuredAmount = 0.00;
            loanArray[index]['emiReceivedDate'] = paymentReceivedDate


        } else if (pendingSecuredAmount >= Number(loanArray[index]['outstandingInterest'])) {

            loanArray[index]['paidAmount'] = Number(loanArray[index]['paidAmount']) + Number(loanArray[index]['outstandingInterest'])
            loanArray[index]['emiStatus'] = "paid"
            transactionData.loanInterestId = loanArray[index]['id']
            transactionData.isExtraDaysInterest = loanArray[index]['isExtraDaysInterest']
            transactionData.interestAmount = loanArray[index]['interestAmount']
            transactionData.penalInterest = loanArray[index]['penalInterest']
            transactionData.emiDueDate = loanArray[index]['emiDueDate']
            transactionData.loanId = loanArray[index]['loanId']
            transactionData.masterLoanId = loanArray[index]['masterLoanId']
            transactionData.credit = loanArray[index]['outstandingInterest']
            transactionData.loanUniqueId = loanArray[index]['customerLoan'].loanUniqueId
            transaction.push(transactionData)
            pendingSecuredAmount = Number(pendingSecuredAmount) - Number(loanArray[index]['outstandingInterest'])
            loanArray[index]['outstandingInterest'] = 0.00
            loanArray[index]['emiReceivedDate'] = paymentReceivedDate
        }

    }
    for (let index = 0; index < loanArray.length; index++) {
        const element = loanArray[index];
        if (Number(element.interestAccrual) >= Number(interestAccrualAmount)) {
            element.interestAccrual = element.interestAccrual - interestAccrualAmount
            interestAccrualAmount = element.interestAccrual
        } else if (Number(element.interestAccrual) < Number(interestAccrualAmount)) {
            element.interestAccrual = 0.00;

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

let allInterestPayment = async (transactionId, paymentReceivedDate) => {

    // let amount = await getCustomerInterestAmount(masterLoanId);

    // let loanDetails = await customerLoanDetailsByMasterLoanDetails(masterLoanId)

    // let loan = await getLoanDetails(masterLoanId);

    // let loan
    let createdBy = 1

    let transactionSplitUp = await models.customerTransactionSplitUp.findAll(
        {
            where: { customerLoanTransactionId: transactionId },
            order: [['loanId', 'asc']],
        },
    )
    // return transactionSplitUp
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

    let securedLoanDetails = await models.customerLoanInterest.findAll({
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
    let temp = []
    for (let index = 0; index < securedLoanDetails.length; index++) {
        temp.push(securedLoanDetails[index].dataValues)
    }
    securedLoanDetails = []
    if (securedPenalInterest > 0) {
        temp = await penalInterestPayment(temp, securedPenalInterest, createdBy);
        Array.prototype.push.apply(transactionDetails, temp.transaction)
        securedLoanDetails = temp.loanArray
    } else {
        securedLoanDetails = temp;
    }
    // console.log(securedLoanDetails)

    if (securedInterest > 0) {
        newSecuredDetails = await generateTranscationAndUpdateInterestValue(securedLoanDetails, securedInterest, createdBy, paymentReceivedDate)
        securedLoanDetails = newSecuredDetails.loanArray
        Array.prototype.push.apply(transactionDetails, newSecuredDetails.transaction)

    }
    let unsecuredLoanDetails
    // unsecure
    if (transactionSplitUp.length > 1) {


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

        let temp = []
        for (let index = 0; index < unsecuredLoanDetails.length; index++) {
            temp.push(unsecuredLoanDetails[index].dataValues)
        }
        unsecuredLoanDetails = []
        if (unsecuredPenalInterest > 0) {

            temp = await penalInterestPayment(temp, unsecuredPenalInterest, createdBy);
            Array.prototype.push.apply(transactionDetails, temp.transaction)
            unsecuredLoanDetails = temp.loanArray
        } else {
            unsecuredLoanDetails = temp;
            // console.log(securedLoanDetails)
        }

        if (unsecuredInterest > 0) {
            let newUnsecuredDetails = await generateTranscationAndUpdateInterestValue(unsecuredLoanDetails, unsecuredInterest, createdBy, paymentReceivedDate)
            unsecuredLoanDetails = newUnsecuredDetails.loanArray
            Array.prototype.push.apply(transactionDetails, newUnsecuredDetails.transaction)
        }
    }

    // if (securedPenalInterest > 0) {
    //     var penalDate = await getPenalDateOfMasterLoan(amount, loanDetails.loan, securedPenalInterest, unsecuredPenalInterest)
    // }

    return { transactionDetails, securedLoanDetails, unsecuredLoanDetails }
}

let penalInterestPayment = async (loanArray, totalPenalAmount, createdBy) => {
    console.log(totalPenalAmount)

    let transaction = []

    let pendingPenalAmount = totalPenalAmount
    let penalAccuralAmount = totalPenalAmount
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
    // console.log(transaction)
    return { loanArray, transaction }
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

    let customerLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['id', 'loanStartDate', 'loanEndDate', 'tenure'],
        order: [
            [models.customerLoanDisbursement, 'loanId', 'asc'],
            [models.customerLoan, 'id', 'asc']
        ],
        include: [
            {
                model: models.customerLoan,
                as: 'customerLoan',
                where: whereCondition,
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
    let securedRatio = securedOutstandingAmount / totalOutstandingAmount * (splitUpRatioAmount)
    let newSecuredOutstandingAmount = securedOutstandingAmount - securedRatio
    let newUnsecuredOutstandingAmount = 0
    let unsecuredRatio = 0
    let unsecuredLoanId = null
    if (loan.isUnsecuredSchemeApplied) {
        unsecuredLoanId = loan.customerLoan[1].id
        unsecuredRatio = unsecuredOutstandingAmount / totalOutstandingAmount * splitUpRatioAmount
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

let getSingleDayInterestAmount = async (loan) => {

    let paymentFrequency = loan.paymentFrequency
    let securedInterest = loan.customerLoan[0].currentInterestRate
    let securedOutstandingAmount = loan.customerLoan[0].outstandingAmount


    // let securedPerDayInterestAmount = await newSlabRateInterestCalcultaion(securedOutstandingAmount, securedInterest, selectedSlab, tenure);

    let securedPerDayInterestAmount = ((securedInterest / 100) * securedOutstandingAmount * (paymentFrequency / 30)) / paymentFrequency

    let secured = await models.customerLoanInterest.findAll({
        where: { emiStatus: { [Op.notIn]: ["paid"] }, loanId: loan.customerLoan[0].id, isExtraDaysInterest: false },
        order: [['emiEndDate', 'asc']]
    });
    var securedTotalInterest = 0
    var unsecuredTotalInterest = 0
    if (secured.length > 0) {
        let startDate = moment(secured[0].emiStartDate)
        let index = secured.findIndex(ele => {
            let a = new Date(ele.emiEndDate);
            let b = new Date()
            return a.getTime() > b.getTime()
        })

        if (index < 0) {
            securedTotalInterest = 0
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
            if (securedMonthInterest > Number(paidAmount)) {
                securedTotalInterest = securedMonthInterest - paidAmount;
            }
            else {
                securedTotalInterest = paidAmount - securedMonthInterest;

            }
            securedTotalInterest = securedTotalInterest.toFixed(2)
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
                let a = new Date(ele.emiEndDate);
                let b = new Date()
                return a.getTime() > b.getTime()
            })


            if (index < 0) {
                unsecuredTotalInterest = 0

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

                if (monthsViseInterest > Number(unsecuredPaidAmount)) {
                    unsecuredTotalInterest = monthsViseInterest - unsecuredPaidAmount
                } else {
                    unsecuredTotalInterest = unsecuredPaidAmount - monthsViseInterest

                }
                unsecuredTotalInterest = unsecuredTotalInterest.toFixed(2)
            }


        }
    }




    return { securedTotalInterest, unsecuredTotalInterest }
}

let splitAmountIntoSecuredAndUnsecured = async (customerLoan, paidAmount) => {

    let loanAmount = customerLoan.outstandingAmount
    let securedLoanAmount = customerLoan.customerLoan[0].outstandingAmount
    let unsecuredLoanAmount = customerLoan.customerLoan[1].outstandingAmount

    let securedRatio = securedLoanAmount / loanAmount * paidAmount
    let unsecuredRatio = unsecuredLoanAmount / loanAmount * paidAmount

    return { securedRatio, unsecuredRatio }
}


let getTransactionPrincipalAmount = async (customerLoanTransactionId) => {
    let transactionDataSecured = await models.customerTransactionSplitUp.findOne({ where: { customerLoanTransactionId: customerLoanTransactionId, isSecured: true } });
    let transactionDataUnSecured = await models.customerTransactionSplitUp.findOne({ where: { customerLoanTransactionId: customerLoanTransactionId, isSecured: false } });
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
            if (daysCount < gracePeriodDays) {
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
                await models.customerLoanInterest.update({ penalInterest: penalAccrual, penalAccrual: penalAccrual, penalOutstanding: penalOutstanding }, { where: { id: dataInfo[j + 1].id } })
            } else {
                penalAccrual = Number(penalAccrual) + Number(dataInfo[dataInfo.length - 1].penalAccrual)
                penalOutstanding = penalAccrual - dataInfo[j].penalPaid
                console.log("update", penalAccrual, dataInfo[j].id)
                await models.customerLoanInterest.update({ penalInterest: penalAccrual, penalAccrual: penalAccrual, penalOutstanding: penalOutstanding }, { where: { id: dataInfo[j].id } })
            }
        }
    }
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
    getSingleDayInterestAmount: getSingleDayInterestAmount,
    getSingleMasterLoanDetail: getSingleMasterLoanDetail,
    splitAmountIntoSecuredAndUnsecured: splitAmountIntoSecuredAndUnsecured,
    penalInterestCalculationForSelectedLoan: penalInterestCalculationForSelectedLoan
}