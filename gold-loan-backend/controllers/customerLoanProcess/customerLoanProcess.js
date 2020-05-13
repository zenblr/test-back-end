// LOAD REQUIRED PACKAGES
const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const CONSTANT = require("../../utils/constant"); // IMPORTING CONSTANT UTIL

const check = require("../../lib/checkLib"); // IMPORTING CHECKLIB 

//  FUNCTION FOR LOAN APPLICATION FORM
exports.applyForLoanApplication = async (req, res, next) => {

    let { customerId, name, accountNumber, ifscCode, aadharNumber, permanentAddress, pincode, officeAddress,
        nomineeName, nomineeAge, relationship, ornamentData, customerUniqueId, mobile, panCardNumber, startDate } = req.body;
    let loanUniqueId = `LOAN${Math.floor(1000 + Math.random() * 9000)}`;
    let appliedForLoanApplication = await sequelize.transaction(async t => {
        let customerLoanCreated = await models.customerLoan.addCustomerLoan(
            customerId, loanUniqueId
            , { transaction: t });
        let loanId = customerLoanCreated.id;
        let customerBankDetailsCreated = await models.customerLoanBankDetail.addCustomerBankDetail(
            loanId, name, accountNumber, ifscCode
            , { transaction: t });
        let customerKycDetailsCreated = await models.customerLoanKycDetail.addCustomerKycDetail(
            loanId, aadharNumber, permanentAddress, pincode, officeAddress
            , { transaction: t });
        let customerNomineeDetailsCreated = await models.customerLoanNomineeDetail.addCustomerNomineeDetail(
            loanId, nomineeName, nomineeAge, relationship
            , { transaction: t });
        let customerOramentsDetailsCreated = await models.customerLoanOrnamentsDetail.addCustomerOrnamentsDetail(
            loanId, ornamentData
            , { transaction: t });
        let customerPersonalDetailsCreated = await models.customerLoanPersonalDetail.addCustomerPersonalDetail(
            loanId, customerUniqueId, mobile, panCardNumber, startDate
            , { transaction: t });
    })

    res.status(201).json({ message: 'you have successfully applied for the loan' });
}


//  FUNCTION TO UPDATE CUSTOMER ORNAMENTS DETAILS
exports.updateCustomerOrnamentsDetail = async (req, res, next) => {
    let { ornamentType, quantity, grossWeight, netWeight, deductionWeight, weightMachineZeroWeight,
        withOrnamentWeight, stoneTouch, acidTest, purityTest, ornamentImage, ltvPercent, ltvAmount, currentLtvAmount } = req.body;

    let id = req.params.id;
    let customerOrnamentsDetailsUpdated = await models.customerLoanOrnamentsDetail.editCustomerOrnamentsDetail(
        id, ornamentType, quantity, grossWeight, netWeight, deductionWeight, weightMachineZeroWeight,
        withOrnamentWeight, stoneTouch, acidTest, purityTest, ornamentImage, ltvPercent, ltvAmount, currentLtvAmount
    );
    if (customerOrnamentsDetailsUpdated[0] == 0) {
        res.status(422).json({ message: 'customer ornaments details not updated' });
    } else {
        res.status(200).json({ message: 'customer ornaments details changed successfully' });
    }
}

//  FUNCTION FOR ADD PACKAGE IMAGES
exports.addPackageImagesForLoan = async (req, res, next) => {

    let { loanId, packageImageData } = req.body;

    let packageImageUploaded = await models.packageImageUploadForLoan.addPackageImages(
        loanId, packageImageData);
    res.status(201).json({ message: 'you have successfully uploaded package images' });
}

//  FUNCTION FOR DISBURSEMENT OF LOAN AMOUNT
exports.disbursementOfLoanAmount = async (req, res, next) => {

    let { loanId, transactionId, date } = req.body;

    let loanAmountDisbursed = await models.disbursementOfLoan.disbursementOfLoanAmount(
        loanId, transactionId, date);
    res.status(201).json({ message: 'you loan amount has been disbursed successfully' });
}

//  FUNCTION FOR GET LOAN DETAILS
exports.getLoanDetails = async (req, res, next) => {
    let loanDetails = await models.customerLoan.findAll({
        include: [{
            model: models.customer,
            as: 'customer',
            attributes: {
                exclude: ['password']
            }
        },
        {
            model: models.customerLoanBankDetail,
            as: 'loanBankDetail'
        },
        {
            model: models.customerLoanKycDetail,
            as: 'loanKycDetail'
        },
        {
            model: models.customerLoanNomineeDetail,
            as: 'loanNomineeDetail'
        },
        {
            model: models.customerLoanOrnamentsDetail,
            as: 'loanOrnamentsDetail'
        },
        {
            model: models.customerLoanPersonalDetail,
            as: 'loanPersonalDetail'
        }]
    });

    if (loanDetails.length === 0) {
        res.status(404).json({ message: 'no loan details found' });
    } else {
        res.status(200).json({ message: 'loan details fetch successfully', loanDetails });
    }
}