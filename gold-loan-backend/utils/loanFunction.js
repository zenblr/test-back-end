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

let payableAmount = async (amount, loan) => {
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
    data.outstandingAmount = loan.outstandingAmount
    data.securedPenalInterest = securedPenalInterest
    data.unsecuredPenalInterest = unsecuredPenalInterest
    data.securedInterest = securedInterest
    data.unsecuredInterest = unsecuredInterest
    data.interest = interest
    data.penalInterest = penalInterest
    data.payableAmount = payableAmount

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
    amount.interest = _.sum(interestAmount);
    amount.penalInterest = _.sum(penalInterest);
    return amount
}

let getLoanDetails = async (masterLoanId) => {
    let loanData = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId }
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
            loanStageId: stageId.id,
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

let getAllDetailsOfCustomerLoan = async (customerLoanId) => {
    let loanData = await models.customerLoan.findOne({
        where: { id: customerLoanId },
        order: [
            ['id', 'asc'],
            [models.customerLoanInterest, 'id', 'asc'],
        ],
        attributes: ['id', 'masterLoanId', 'selectedSlab', 'loanAmount', 'outstandingAmount', 'currentSlab', 'currentInterestRate', 'penalInterestLastReceivedDate', 'penalInterest'],
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
        where: { loanId: loanId, masterLoanId: masterLaonId, emiStatus: 'paid' },
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
        where: { loanId: loanId, masterLoanId: masterLaonId },
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
        where: { loanId: loanId, masterLoanId: masterLaonId },
        order: [['emiDueDate', 'DESC']],
        attributes: ['id', 'paidAmount']
    });
    return lastInterest;
}

let getAllNotPaidInterest = async (loanId) => {
    let allNotPaidInterest = await models.customerLoanInterest.findAll({
        where: { loanId: loanId, emiStatus: { [Op.notIn]: ['paid'] } },
        attributes: ['id', 'paidAmount']
    });
    return allNotPaidInterest;
}

let getAllInterestLessThanDate = async (loanId, date) => {
    let allInterestLessThanDate = await models.customerLoanInterest.findAll({
        where: { loanId: loanId, emiDueDate: { [Op.lte]: date, }, emiStatus: { [Op.notIn]: ['paid'] } },
        attributes: ['id', 'paidAmount']
    });
    return allInterestLessThanDate;
}

let getPendingNoOfDaysInterest = async (loanId, date) => {
    let pendingNoOfDaysInterest = await models.customerLoanInterest.findOne({
        where: { loanId: loanId, emiDueDate: { [Op.gt]: date, }, emiStatus: { [Op.notIn]: ['paid'] } },
        attributes: ['id', 'paidAmount'],
        order: [['emiDueDate', 'ASC']]
    });
    return pendingNoOfDaysInterest;
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
            data.interestAmount = (securedTable[i].interestAmount + unsecuredTable[i].interestAmount).toFixed(2)
            data.balanceAmount = (securedTable[i].outstandingInterest + unsecuredTable[i].outstandingInterest).toFixed(2)
            data.paidAmount = securedTable[i].paidAmount + unsecuredTable[i].paidAmount
            data.panelInterest = securedTable[i].panelInterest + unsecuredTable[i].panelInterest
        } else {
            data.emiReceivedDate = securedTable[i].emiReceivedDate
            data.interestAmount = (securedTable[i].interestAmount).toFixed(2)
            data.balanceAmount = (securedTable[i].outstandingInterest).toFixed(2)
            data.paidAmount = securedTable[i].paidAmount
            data.panelInterest = securedTable[i].panelInterest
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
            let loanStartDate;
            if (!lastPaidEmi) {
                loanStartDate = moment(loan.masterLoan.loanStartDate);
                noOfDays = currentDate.diff(loanStartDate, 'days');
            } else {
                loanStartDate = moment(lastPaidEmi.emiDueDate);
                noOfDays = currentDate.diff(loanStartDate, 'days');
            }
            if (noOfDays > loan.currentSlab) {
                //scenario 2 slab changed
                let stepUpSlab = await getStepUpslab(loan.id, noOfDays);
                let interest = await newSlabRateInterestCalcultaion(loan.outstandingAmount, stepUpSlab.interestRate, loan.selectedSlab, loan.masterLoan.tenure);
                let allInterest = await getAllNotPaidInterest(loan.id)//get all interest
                let interestLessThanDate = await getAllInterestLessThanDate(loan.id, date);
                //update interestAccrual & interest amount
                for (const interestData of interestLessThanDate) {
                    let outstandingInterest = interest.amount - interestData.paidAmount;
                    let interestAccrual = interest.amount - interestData.paidAmount;
                    await models.customerLoanInterest.update({ interestAmount: interest.amount, outstandingInterest, interestAccrual, interestRate: stepUpSlab.interestRate }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
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
                            await models.customerLoanInterest.update({ interestAccrual: amount, interestRate: stepUpSlab.interestRate, outstandingInterest: amount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
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
                    let oneMonthAmount = interest.amount / (stepUpSlab.days / 30);
                    let amount = oneMonthAmount * Math.ceil(interest.length).toFixed(2);
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
                    //update interestAccrual 
                    for (const interestData of interestLessThanDate) {
                        let interestAccrual = interest.amount - interestData.paidAmount;
                        await models.customerLoanInterest.update({ interestAccrual }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
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
                                await models.customerLoanInterest.update({ interestAccrual: amount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                            }
                        }
                    }
                }
            }
        }
    });
    return noOfDays;
}


let customerLoanDetailsByMasterLoanDetails = async (masterLoanId) => {
    let loan = await models.customerLoanMaster.findOne({
        where: { isActive: true, id: masterLoanId },
        attributes: ['id', 'outstandingAmount', 'finalLoanAmount', 'tenure'],
        order: [
            [models.customerLoan, 'id', 'asc']
        ],
        include: [{
            model: models.customerLoan,
            as: 'customerLoan',
            where: { isActive: true }
        }]
    });

    return { loan }
}


let generateTranscationAndUpdateInterestValue = async (loanArray, amount, createdBy) => {


    let transaction = []
    let pendingSecuredAmount = amount
    for (let index = 0; index < loanArray.length; index++) {
        let transactionData = {
            transactionAmont: 0,
            createdBy: createdBy,
            paymentDate: Date.now()
        }
        // outsatnding 
        if (pendingSecuredAmount <= 0) {

            break;

        } else if (pendingSecuredAmount < Number(loanArray[index]['outstandingInterest'])) {

            loanArray[index]['emiStatus'] = "partially paid"
            loanArray[index]['paidAmount'] = pendingSecuredAmount.toFixed(2)
            transactionData.transactionAmont = pendingSecuredAmount.toFixed(2)
            transactionData.loanInterestId = loanArray[index]['id']
            transactionData.loanId = loanArray[index]['loanId']
            transactionData.masterLoanId = loanArray[index]['masterLoanId']
            transactionData.debit = pendingSecuredAmount.toFixed(2)
            transaction.push(transactionData)
            pendingSecuredAmount = (loanArray[index]['outstandingInterest'] - pendingSecuredAmount).toFixed(2)
            loanArray[index]['outstandingInterest'] = pendingSecuredAmount
            pendingSecuredAmount = 0.00;

        } else if (pendingSecuredAmount > Number(loanArray[index]['outstandingInterest'])) {

            loanArray[index]['paidAmount'] = loanArray[index]['outstandingInterest']
            transactionData.transactionAmont = loanArray[index]['outstandingInterest']
            loanArray[index]['emiStatus'] = "paid"
            transactionData.loanInterestId = loanArray[index]['id']
            transactionData.loanId = loanArray[index]['loanId']
            transactionData.masterLoanId = loanArray[index]['masterLoanId']
            transactionData.debit = pendingSecuredAmount.toFixed(2)
            transaction.push(transactionData)
            pendingSecuredAmount = Number(pendingSecuredAmount) - Number(loanArray[index]['outstandingInterest'])
            loanArray[index]['outstandingInterest'] = 0.00
        }
        loanArray[index]['emiReceivedDate'] = Date.now()

    }
    return { loanArray, transaction }
}

let allInterestPayment = async (masterLoanId, payableAmount, createdBy) => {

    let amount = await getCustomerInterestAmount(masterLoanId);

    let loanDetails = await customerLoanDetailsByMasterLoanDetails(masterLoanId)

    let loan = await getLoanDetails(masterLoanId);

    // let loan


    // let outstandingAmount = Number(loan.outstandingAmount.toFixed(2))

    let securedPenalInterest = amount.secured.penalInterest
    let securedInterest = amount.secured.interest
    let securedOutstandingAmount = loanDetails.loan.customerLoan[0].outstandingAmount

    let unsecuredInterest = 0
    let unsecuredPenalInterest = 0
    let unsecuredOutstandingAmount = 0
    // let payableAmount = amount.secured.interest + amount.secured.penalInterest
    if (loanDetails.loan.customerLoan.length > 1) {
        unsecuredInterest = amount.unsecured.interest
        unsecuredPenalInterest = amount.unsecured.penalInterest
        unsecuredOutstandingAmount = loanDetails.loan.customerLoan[1].outstandingAmount
    }
    let totalOutstandingAmount = Number(securedOutstandingAmount) + Number(unsecuredOutstandingAmount)

    // divinding in ratio

    // secure 
    let securedRatio = securedOutstandingAmount / totalOutstandingAmount * payableAmount;
    if (Number(securedPenalInterest) > 0) {
        securedRatio = Number(securedRatio - securedPenalInterest)
    }
    if (amount.unsecured) {

        var unsecuredRatio = unsecuredOutstandingAmount / totalOutstandingAmount * payableAmount
        if (Number(unsecuredPenalInterest) > 0) {
            unsecuredRatio = Number(unsecuredRatio - unsecuredPenalInterest)
        }
    }



    let transactionDetails = []

    let securedLoanDetails = await models.customerLoanInterest.findAll({
        where: {
            loanId: loanDetails.loan.customerLoan[0].id,
            emiStatus: { [Op.in]: ['pending', 'partially paid'] }
        },
        order: [['emiDueDate']]
    })
    let temp = []
    for (let index = 0; index < securedLoanDetails.length; index++) {
        temp.push(securedLoanDetails[index].dataValues)
    }
    securedLoanDetails = []
    if (Number(securedPenalInterest) > 0) {
        temp = await penalInterestPayment(temp, securedPenalInterest, createdBy);
        Array.prototype.push.apply(transactionDetails, temp.transaction)
        securedLoanDetails = temp.loanArray
    } else {
        securedLoanDetails = temp;
    }
    console.log(securedLoanDetails)


    newSecuredDetails = await generateTranscationAndUpdateInterestValue(securedLoanDetails, securedRatio, createdBy)
    securedLoanDetails = newSecuredDetails.loanArray
    Array.prototype.push.apply(transactionDetails, newSecuredDetails.transaction)

    // unsecure
    if (loanDetails.loan.customerLoan.length > 1) {


        var unsecuredLoanDetails = await models.customerLoanInterest.findAll({
            where: {
                loanId: loanDetails.loan.customerLoan[1].id,
                emiStatus: { [Op.in]: ['pending', 'partially paid'] }
            },
            order: [['emiDueDate']]
        })

        let temp = []
        for (let index = 0; index < unsecuredLoanDetails.length; index++) {
            temp.push(unsecuredLoanDetails[index].dataValues)
        }
        unsecuredLoanDetails = []
        if (Number(unsecuredPenalInterest) > 0) {

            temp = await penalInterestPayment(temp, unsecuredPenalInterest, createdBy);
            Array.prototype.push.apply(transactionDetails, temp.transaction)
            unsecuredLoanDetails = temp.loanArray
        } else {
            unsecuredLoanDetails = temp;
            // console.log(securedLoanDetails)
        }

        let newUnsecuredDetails = await generateTranscationAndUpdateInterestValue(unsecuredLoanDetails, unsecuredRatio, createdBy)
        unsecuredLoanDetails = newUnsecuredDetails.loanArray
        Array.prototype.push.apply(transactionDetails, newUnsecuredDetails.transaction)
    }

    return { transactionDetails, securedLoanDetails, unsecuredLoanDetails }
}



let penalInterestPayment = async (loanArray, totalPenalAmount, createdBy) => {


    let transaction = []

    let pendingPenalAmount = totalPenalAmount
    for (let index = 0; index < loanArray.length; index++) {

        let transactionData = {
            transactionAmont: 0,
            createdBy: createdBy,
        }

        if (pendingPenalAmount <= 0) {

            break;

        } else if (pendingPenalAmount < Number(loanArray[index]['penalInterest'])) {

            loanArray[index]['penalPaid'] = pendingPenalAmount.toFixed(2)
            transactionData.transactionAmont = pendingSecuredAmount
            transactionData.loanInterestId = loanArray[index]['id']
            transactionData.loanId = loanArray[index]['loanId']
            transactionData.masterLoanId = loanArray[index]['masterLoanId']
            transactionData.isPenalInterest = true;
            transactionData.debit = pendingPenalAmount.toFixed(2)
            transaction.push(transactionData)
            pendingPenalAmount = (loanArray[index]['penalInterest'] - pendingPenalAmount).toFixed(2)
            loanArray[index]['penalOutstanding'] = pendingPenalAmount
            pendingPenalAmount = 0.00;

        } else if (pendingPenalAmount > Number(loanArray[index]['penalInterest'])) {

            loanArray[index]['penalPaid'] = pendingPenalAmount.toFixed(2)
            transactionData.transactionAmont = pendingPenalAmount.toFixed(2)
            transactionData.loanInterestId = loanArray[index]['id']
            transactionData.loanId = loanArray[index]['loanId']
            transactionData.masterLoanId = loanArray[index]['masterLoanId']
            transactionData.isPenalInterest = true;
            transactionData.debit = pendingPenalAmount.toFixed(2)
            transaction.push(transactionData)
            pendingPenalAmount = Number(pendingPenalAmount) - Number(loanArray[index]['penalOutstanding'])
            loanArray[index]['penalOutstanding'] = 0.00
        }

    }
    console.log(transaction)
    return { loanArray, transaction }
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
    payableAmount: payableAmount,
    customerLoanDetailsByMasterLoanDetails: customerLoanDetailsByMasterLoanDetails,
    allInterestPayment: allInterestPayment,
    penalInterestPayment: penalInterestPayment
}