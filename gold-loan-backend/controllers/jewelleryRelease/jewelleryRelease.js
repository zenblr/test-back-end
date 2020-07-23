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
        attributes: ['customerId', 'masterLoanUniqueId', 'finalLoanAmount', 'tenure', 'loanStartDate', 'loanEndDate'],
        include: [
            {
                model: models.customerLoan,
                as: 'customerLoan',
                attributes: ['masterLoanId', 'loanUniqueId', 'loanAmount']
            },
            {
                model: models.customerLoanPersonalDetail,
                as: 'loanPersonalDetail',
                attributes: ['customerUniqueId']
            }, {
                model: models.customerLoanOrnamentsDetail,
                as: 'loanOrnamentsDetail',
                include: [
                    {
                        model: models.ornamentType,
                        as: "ornamentType",
                        attributes:['name','id'],
                        include:[{
                            model: models.packetOrnament,
                            as: 'packetOrnament',
                            attributes:['packetId','id','ornamentTypeId'],
                            include:[{
                                model: models.packet,
                                as:"packet"
                            }]
                        }]
                    }
                ]
            }]
    });
    let lastPayment = await getLoanLastPayment(masterLoanId);
    return res.status(200).json({ message: 'success', customerLoan,lastPayment })
}

async function getLoanLastPayment(masterLoanId) {
    let lastPayment = await models.customerLoanInterest.findOne({
        where: { masterLoanId: masterLoanId, emiStatus: "complete" },
        order: [["updatedAt", "DESC"]],
    });
    return lastPayment;
}

async function getGoldRate() {
    let goldRate = await models.goldRate.findOne({
        order:[["updatedAt", "DESC"]],
        attributes:['goldRate']
    })
    return goldRate.goldRate;
}

async function getLoanDetails(masterLoanId) {
    let loanData = await models.customerLoanMaster.findOne({
        where:{id:masterLoanId}
    })
    return loanData;
}

async function getGlobalSetting() {
    let globalSettings = await models.globalSetting.getGlobalSetting();
    return globalSettings;
}

async function ornementsDetails(masterLoanId,whereBlock) {
    let ornaments = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['customerId', 'masterLoanUniqueId', 'finalLoanAmount', 'tenure', 'loanStartDate', 'loanEndDate'],
        include: [ {
                model: models.customerLoanOrnamentsDetail,
                as: 'loanOrnamentsDetail',
                where:whereBlock,
                include: [
                    {
                        model: models.ornamentType,
                        as: "ornamentType",
                        attributes:['name','id'],
                        include:[{
                            model: models.packetOrnament,
                            as: 'packetOrnament',
                            attributes:['packetId','id','ornamentTypeId'],
                            include:[{
                                model: models.packet,
                                as:"packet"
                            }]
                        }]
                    }
                ]
            }]
    });
    return ornaments;
}

async function getornamentsWeightInfo(requestedOrnaments,otherOrnaments,loanData) {
    let ornamentsWeightInfo = {
        releaseGrossWeight:0,
        releaseDeductionWeight:0,
        releaseNetWeight:0,
        remainingGrossWeight:0,
        remainingDeductionWeight:0,
        remainingNetWeight:0,
        releaseAmount:0,
        currentLtv:0,
        previousLtv:0,
        outstandingAmount:0
    }
    let globalSettings = await getGlobalSetting();
    let goldRate = await getGoldRate();
    ornamentsWeightInfo.currentLtv = goldRate * (globalSettings.ltvGoldValue/100);
    ornamentsWeightInfo.previousLtv = requestedOrnaments.loanOrnamentsDetail[0].currentLtvAmount;
    if(requestedOrnaments != null){
        for(const ornaments of requestedOrnaments.loanOrnamentsDetail){
            ornamentsWeightInfo.releaseGrossWeight = ornamentsWeightInfo.releaseGrossWeight + parseFloat(ornaments.grossWeight);
            ornamentsWeightInfo.releaseDeductionWeight = ornamentsWeightInfo.releaseDeductionWeight + parseFloat(ornaments.deductionWeight);
            ornamentsWeightInfo.releaseNetWeight = ornamentsWeightInfo.releaseNetWeight + parseFloat(ornaments.netWeight);
            if(otherOrnaments == null){
                let ltvAmount = ornamentsWeightInfo.currentLtv*(ornaments.ltvPercent/100)
                ornamentsWeightInfo.outstandingAmount = ornamentsWeightInfo.outstandingAmount + (ltvAmount * parseFloat(ornaments.netWeight));
            }
        }
    }
    if(otherOrnaments != null){
        for(const ornaments of otherOrnaments.loanOrnamentsDetail){
            ornamentsWeightInfo.remainingGrossWeight = ornamentsWeightInfo.remainingGrossWeight + parseFloat(ornaments.grossWeight);
            ornamentsWeightInfo.remainingDeductionWeight = ornamentsWeightInfo.remainingDeductionWeight + parseFloat(ornaments.deductionWeight);
            ornamentsWeightInfo.remainingNetWeight = ornamentsWeightInfo.remainingNetWeight + parseFloat(ornaments.netWeight);
            let ltvAmount = ornamentsWeightInfo.currentLtv*(ornaments.ltvPercent/100)
            ornamentsWeightInfo.releaseAmount = ornamentsWeightInfo.releaseAmount + (ltvAmount * parseFloat(ornaments.netWeight));
        }
        ornamentsWeightInfo.releaseAmount = parseFloat(loanData.finalLoanAmount) - Math.round(ornamentsWeightInfo.releaseAmount)
    }
    
    ornamentsWeightInfo.outstandingAmount = Math.round(ornamentsWeightInfo.outstandingAmount);
    return ornamentsWeightInfo;
}

async function getornamentLoanInfo(masterLoanId,ornamentWeight) {
    let loanData = await models.customerLoan.findAll({where:{masterLoanId},attributes:['loanUniqueId']});
    let loanAmountData = await models.customerLoanMaster.findOne({where:{id:masterLoanId},attributes:['finalLoanAmount']});
    let loanDetails = {
        loanData,
        finalLoanAmount:0,
        interestAmount:0,
        penalInterest:0,
        totalPayableAmount:0,
    }
    loanDetails.finalLoanAmount = loanAmountData.finalLoanAmount;
    return loanDetails;
}

exports.ornamentsAmountDetails = async (req, res, next) => {
    let {masterLoanId,ornamentId} = req.body;
    let whereSelectedOrmenemts = {id: { [Op.in]: ornamentId }, isActive: true};
    let whereOtherOrmenemts = {id: { [Op.notIn]: ornamentId }, isActive: true};
    let loanData = await getLoanDetails(masterLoanId);
    let requestedOrnaments = await ornementsDetails(masterLoanId,whereSelectedOrmenemts);
    let otherOrnaments = await ornementsDetails(masterLoanId,whereOtherOrmenemts);
    let ornamentWeight = await getornamentsWeightInfo(requestedOrnaments,otherOrnaments,loanData);
    let loanInfo = await getornamentLoanInfo(masterLoanId,ornamentWeight);
    return res.status(200).json({ message: 'success', ornamentWeight,loanInfo });
}

exports.ornamentsPartRelease = async (req, res, next) => {
    let {paymentType,paidAmount,bankName,chequeNumber,ornamentId,depositDate,transactionId,masterLoanId,releaseAmount,interestAmount,penalInterest,payableAmount} = req.body;
    
    





    return res.status(200).json({ message: 'success', ornamentWeight,loanInfo });
}

