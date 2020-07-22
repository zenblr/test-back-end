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

async function getornamentsWeightInfo(requestedOrnaments,otherOrnaments) {
    let ornamentsWeightInfo = {
        releaseGrossWeight:0,
        releaseDeductionWeight:0,
        releaseNetWeight:0,
        remainingGrossWeight:0,
        remainingDeductionWeight:0,
        remainingNetWeight:0,
        releaseAmount:0,
        currentLtv:0,
        previousLtv:0
    }
    let goldRate = await getGoldRate();
    ornamentsWeightInfo.currentLtv = goldRate;
    ornamentsWeightInfo.previousLtv = requestedOrnaments.loanOrnamentsDetail[0].currentLtvAmount;
    if(requestedOrnaments != null){
        for(const ornaments of requestedOrnaments.loanOrnamentsDetail){
            ornamentsWeightInfo.releaseGrossWeight = ornamentsWeightInfo.releaseGrossWeight + parseInt(ornaments.grossWeight);
            ornamentsWeightInfo.releaseDeductionWeight = ornamentsWeightInfo.releaseDeductionWeight + parseInt(ornaments.deductionWeight);
            ornamentsWeightInfo.releaseNetWeight = ornamentsWeightInfo.releaseNetWeight + parseInt(ornaments.netWeight);
        }
    }
    if(otherOrnaments != null){
        for(const ornaments of otherOrnaments.loanOrnamentsDetail){
            ornamentsWeightInfo.remainingGrossWeight = ornamentsWeightInfo.remainingGrossWeight + parseInt(ornaments.grossWeight);
            ornamentsWeightInfo.remainingDeductionWeight = ornamentsWeightInfo.remainingDeductionWeight + parseInt(ornaments.deductionWeight);
            ornamentsWeightInfo.remainingNetWeight = ornamentsWeightInfo.remainingNetWeight + parseInt(ornaments.netWeight);
        }
    }
    ornamentsWeightInfo.releaseAmount = parseInt(ornamentsWeightInfo.currentLtv)*ornamentsWeightInfo.releaseNetWeight;
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
    let requestedOrnaments = await ornementsDetails(masterLoanId,whereSelectedOrmenemts);
    let otherOrnaments = await ornementsDetails(masterLoanId,whereOtherOrmenemts);
    let ornamentWeight = await getornamentsWeightInfo(requestedOrnaments,otherOrnaments);
    let loanInfo = await getornamentLoanInfo(masterLoanId,ornamentWeight)
    return res.status(200).json({ message: 'success', ornamentWeight,loanInfo })
}

