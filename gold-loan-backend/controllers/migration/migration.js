const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const jwt = require('jsonwebtoken');
const uuidAPIKey = require('uuid-apikey');
const { JWT_SECRETKEY, JWT_EXPIRATIONTIME } = require('../../utils/constant');

exports.schemeMigration = async (req, res, next) => {
    let schemeBranch = [];
    let stage = await models.loanStage.findOne({
        where: { name: 'applying' }
    })
    let transfer = await models.loanStage.findOne({
        where: { name: 'loan transfer' }
    })
    let disbursed = await models.loanStage.findOne({
        where: { name: 'disbursed' }
    })
    let masterLoan = await models.customerLoanMaster.findAll({
        where:{
            loanStageId: { [Op.notIn]: [stage.id, transfer.id, disbursed.id] },
            isLoanCompleted: false,
            isActive: true
        },
        attributes:['id','internalBranchId']
    });
    for(const data of masterLoan){
        let securedPair = {};
        let unSecuredPair = {};
        let securedLoan = await models.customerLoan.findOne({
            where: { masterLoanId: data.id ,loanType : 'secured'},
            attributes : ['id','schemeId']
        })
        let unSecuredLoan = await models.customerLoan.findOne({
            where: { masterLoanId: data.id ,loanType : 'unsecured'},
            attributes : ['id','schemeId']
        })
        if(securedLoan){
            securedPair.schemeId = securedLoan.schemeId;
            securedPair.internalBranchId = data.internalBranchId
            securedPair.loanId = data.id
            schemeBranch.push(securedPair);
        }
        if(unSecuredLoan){
            unSecuredPair.schemeId = unSecuredLoan.schemeId;
            unSecuredPair.internalBranchId = data.internalBranchId
            unSecuredPair.loanId = data.id
            schemeBranch.push(unSecuredPair);
        }
    }

    return res.status(200).json({message:"Success",data:schemeBranch})
}