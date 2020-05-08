// LOAD REQUIRED PACKAGES
const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION

const check = require("../../lib/checkLib"); // IMPORTING CHECKLIB 

//  FUNCTION FOR LOAN APPLICATION FORM
exports.applyForLoanApplication = async (req, res, next) => {

    let { customerId, applicationFormForAppraiser, goldValuationForAppraiser, loanStatusForAppraiser, totalEligibleAmt, totalFinalInterestAmt,
        name, accountNumber, ifscCode, aadharNumber, permanentAddress, pincode, officeAddress, officePin, nomineeData,
        ornamentData, customerUniqueId, mobile, panCardNumber, startDate, partnerName, schemeName, finalLoanAmount,
        loanStartDate, tenure, loanEndDate, paymentType, interestRate } = req.body;
    let appliedForLoanApplication = await sequelize.transaction(async t => {
        let customerLoanCreated = await models.customerLoan.addCustomerLoan(
            customerId, applicationFormForAppraiser, goldValuationForAppraiser, loanStatusForAppraiser, totalEligibleAmt, totalFinalInterestAmt
            , { transaction: t });
        let loanId = customerLoanCreated.id;
        let customerBankDetailsCreated = await models.customerLoanBankDetail.addCustomerBankDetail(
            loanId, name, accountNumber, ifscCode
            , { transaction: t });
        let customerKycDetailsCreated = await models.customerLoanKycDetail.addCustomerKycDetail(
            loanId, aadharNumber, permanentAddress, pincode, officeAddress, officePin
            , { transaction: t });
        let customerNomineeDetailsCreated = await models.customerLoanNomineeDetail.addCustomerNomineeDetail(
            loanId, nomineeData
            , { transaction: t });
        let customerOramentsDetailsCreated = await models.customerLoanOrnamentsDetail.addCustomerOrnamentsDetail(
            loanId, ornamentData
            , { transaction: t });
        let customerPersonalDetailsCreated = await models.customerLoanPersonalDetail.addCustomerPersonalDetail(
            loanId, customerUniqueId, mobile, panCardNumber, startDate
            , { transaction: t });
        let finalloanCalculatorCreated = await models.finalLoanCalculator.addFinalLoanCalculator(loanId, partnerName, schemeName,
            finalLoanAmount, loanStartDate, tenure, loanEndDate, paymentType, interestRate, { transaction: t })
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
    let loanDetails = await models.customerLoan.getLoanDetailById(loanId);

    if (loanDetails !== null && loanDetails.loanUniqueId !== null && loanDetails.loanStatusForBM === 'confirmed') {
        let packageImageUploaded = await models.packageImageUploadForLoan.addPackageImages(
            loanId, packageImageData);
        res.status(201).json({ message: 'you have successfully uploaded package images' });
    } else {
        res.status(404).json({ message: 'given loan id is not proper' })
    }
}

//  FUNCTION FOR DISBURSEMENT OF LOAN AMOUNT
exports.disbursementOfLoanAmount = async (req, res, next) => {

    let { loanId, transactionId, date } = req.body;
    let loanDetails = await models.customerLoan.getLoanDetailById(loanId);

    if (loanDetails !== null && loanDetails.loanUniqueId !== null && loanDetails.loanStatusForBM === 'confirmed') {
        let loanAmountDisbursed = await models.disbursementOfLoan.disbursementOfLoanAmount(
            loanId, transactionId, date);
        res.status(201).json({ message: 'you loan amount has been disbursed successfully' });
    } else {
        res.status(404).json({ message: 'given loan id is not proper' })
    }
}

//  FUNCTION FOR GET LOAN DETAILS
exports.getLoanDetails = async (req, res, next) => {
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let associateModel = [{
        model: models.customer,
        as: 'customer',
        where: { isActive: true },
        attributes: { exclude: ['password'] }
    },
    {
        model: models.customerLoanBankDetail,
        as: 'loanBankDetail',
        where: { isActive: true }
    },
    {
        model: models.customerLoanKycDetail,
        as: 'loanKycDetail',
        where: { isActive: true }
    },
    {
        model: models.customerLoanNomineeDetail,
        as: 'loanNomineeDetail',
        where: { isActive: true }
    },
    {
        model: models.customerLoanOrnamentsDetail,
        as: 'loanOrnamentsDetail',
        where: { isActive: true }
    },
    {
        model: models.customerLoanPersonalDetail,
        as: 'loanPersonalDetail',
        where: { isActive: true }
    },
    {
        model: models.packageImageUploadForLoan,
        as: 'packetDetails',
    },
    {
        model: models.finalLoanCalculator,
        as: 'finalCalculator',
        where: { isActive: true }
    }]

    let loanDetails = await models.customerLoan.findAll({
        where: { isActive: true },
        include: associateModel,
        order: [
            ['id', 'DESC']
        ],
        offset: offset,
        limit: pageSize
    });
    let count = await models.customerLoan.findAll({
        where: { isActive: true },
        include: associateModel,
    });
    if (loanDetails.length === 0) {
        res.status(404).json({ message: 'no loan details found' });
    } else {
        res.status(200).json({ message: 'loan details fetch successfully', loanDetails, count: count.length });
    }
}

//  FUNCTION TO GET APPROVAL FROM BM
exports.approvalFromBM = async (req, res, next) => {
    let { applicationFormForBM, goldValuationForBM, loanStatusForBM } = req.body;

    let id = req.params.id;
    let loanUniqueId;

    if (applicationFormForBM === true && goldValuationForBM === true && loanStatusForBM === 'confirmed') {
        loanUniqueId = `LOAN${Math.floor(1000 + Math.random() * 9000)}`;
    } else {
        loanUniqueId = null;
    }
    let approvedByBM = await models.customerLoan.approvalFromBM(
        id, applicationFormForBM, goldValuationForBM, loanStatusForBM, loanUniqueId
    );
    if (approvedByBM[0] == 0) {
        res.status(422).json({ message: 'BM approval not working properly' });
    } else {
        res.status(200).json({ message: 'BM gives approval to applied loan' });
    }
}

//  FUNCTION FOR GET APPLIED LOAN DETAILS
exports.appliedLoanDetails = async (req, res, next) => {
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let searchQuery = {
        [Op.or]: {
            "$customer.first_name$": { [Op.iLike]: search + '%' },
            "$customer.mobile_number$": { [Op.iLike]: search + '%' },
            "$customer.pan_card_number$": { [Op.iLike]: search + '%' },
            "$customer.customer_unique_id$": { [Op.iLike]: search + '%' },
            createdAt: sequelize.where(
                sequelize.cast(sequelize.col("createdAt"), "varchar"),
                {
                    [Op.iLike]: search + "%"
                }),
        },
        isActive: true
    };

    let associateModel = [{
        model: models.customer,
        as: 'customer',
        where: { isActive: true },
        attributes: { exclude: ['password'] }
    }]

    let appliedLoanDetails = await models.customerLoan.findAll({
        where: searchQuery,
        include: associateModel,
        order: [
            ['id', 'DESC']
        ],
        offset: offset,
        limit: pageSize,

    });
    let count = await models.customerLoan.findAll({
        where: searchQuery,
        include: associateModel,
    });
    if (appliedLoanDetails.length === 0) {
        res.status(404).json({ message: 'no loan details found' });
    } else {
        res.status(200).json({ message: 'applied loan details fetch successfully', appliedLoanDetails, count: count.length });
    }
}

//  FUNCTION FOR GET CUSTOMER DETAILS
exports.customerDetails = async (req, res, next) => {

    let customerUniqueId = req.params.customerUniqueId;
    let customerData = await models.customer.findOne({
        where: { customerUniqueId, kycStatus: 'confirm', isActive: true },
        attributes: ['id', 'customerUniqueId', 'panCardNumber', 'mobileNumber'],
        include: [{
            model: models.customerKycPersonalDetail,
            // where: { isActive: true },
            as: 'customerKyc',
            attributes: ['id', 'identityTypeId', 'identityProof', 'identityProofNumber'],
            include: [{
                model: models.identityType,
                as: 'identityType'
            }]
        },
        {
            model: models.customerKycAddressDetail,
            // where: { isActive: true },
            as: 'customerKycAddress',
            attributes: ['id', 'addressType', 'address', 'pinCode', 'addressProof']
        }, {
            model: models.customerKycBankDetail,
            // where: { isActive: true },
            as: 'customerKycBank',
            attributes: ['id', 'bankName', 'accountNumber', 'ifscCode']
        }]
    }
    )

    if (!customerData) {
        res.status(404).json({ message: 'no customer details found' });
    } else {
        res.status(200).json({ message: 'customer details fetch successfully', customerData });
    }
}