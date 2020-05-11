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
        name, accountNumber, ifscCode, identityProof, idCardNumber, permanentAddress, permanentAddState, permanentAddCity, permanentAddPin, permanentAddProof,
        permanentAddCardNumber, residentialAddress, residentialAddState, residentialAddCity, residentialAddPin, residentialAddProof,
        residentialAddCardNumber, nomineeData, ornamentData, customerUniqueId, mobile, panCardNumber, startDate, partnerName, schemeName, finalLoanAmount,
        loanStartDate, tenure, loanEndDate, paymentFrequency, interestRate } = req.body;

    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let appliedForLoanApplication = await sequelize.transaction(async t => {
        let customerLoanCreated = await models.customerLoan.addCustomerLoan(customerId, applicationFormForAppraiser,
            goldValuationForAppraiser, loanStatusForAppraiser, totalEligibleAmt, totalFinalInterestAmt, createdBy, modifiedBy
            , { transaction: t });
        let loanId = customerLoanCreated.id;
        let customerBankDetailsCreated = await models.customerLoanBankDetail.addCustomerBankDetail(
            loanId, name, accountNumber, ifscCode, createdBy, modifiedBy
            , { transaction: t });
        let customerKycDetailsCreated = await models.customerLoanKycDetail.addCustomerKycDetail(
            loanId, identityProof, idCardNumber, permanentAddress, permanentAddState, permanentAddCity, permanentAddPin, permanentAddProof,
            permanentAddCardNumber, residentialAddress, residentialAddState, residentialAddCity, residentialAddPin, residentialAddProof,
            residentialAddCardNumber, createdBy, modifiedBy
            , { transaction: t });
        let customerNomineeDetailsCreated = await models.customerLoanNomineeDetail.addCustomerNomineeDetail(
            loanId, nomineeData, createdBy, modifiedBy
            , { transaction: t });
        let customerOramentsDetailsCreated = await models.customerLoanOrnamentsDetail.addCustomerOrnamentsDetail(
            loanId, ornamentData, createdBy, modifiedBy
            , { transaction: t });
        let customerPersonalDetailsCreated = await models.customerLoanPersonalDetail.addCustomerPersonalDetail(
            loanId, customerUniqueId, mobile, panCardNumber, startDate, createdBy, modifiedBy
            , { transaction: t });
        let finalloanCalculatorCreated = await models.finalLoanCalculator.addFinalLoanCalculator(loanId, partnerName, schemeName,
            finalLoanAmount, loanStartDate, tenure, loanEndDate, paymentFrequency, interestRate, createdBy, modifiedBy, { transaction: t })
    })

    res.status(201).json({ message: 'you have successfully applied for the loan' });
}


//  FUNCTION TO UPDATE CUSTOMER ORNAMENTS DETAILS
exports.updateCustomerLoanDetail = async (req, res, next) => {
    let { ornamentData, partnerName, schemeName, finalLoanAmount, loanStartDate, tenure, loanEndDate,
        paymentFrequency, interestRate, totalEligibleAmt, totalFinalInterestAmt } = req.body;
    let loanId = req.params.loanId;
    let modifiedBy = req.userData.id;

    let customerOrnamentsDetailsUpdated = await models.customerLoanOrnamentsDetail.bulkCreate(ornamentData, {
        updateOnDuplicate: ["ornamentType", "quantity", "grossWeight", "netWeight", "deductionWeight", "weightMachineZeroWeight", "withOrnamentWeight", "stoneTouch", "acidTest", "purityTest",
            "karat", "purity", "ltvRange", "ornamentImage", "ltvPercent", "ltvAmount", "currentLtvAmount"]
    })

    let finalLoanCalculatorUpdated = await models.finalLoanCalculator.update({
        partnerName, schemeName, finalLoanAmount, loanStartDate, tenure, loanEndDate,
        paymentFrequency, interestRate, modifiedBy
    }, { where: { loanId, isActive: true } })

    let customerLoanUpdated = await models.customerLoan.update({
        totalEligibleAmt, totalFinalInterestAmt, modifiedBy
    }, { where: { id: loanId, isActive: true } })

    if (customerLoanUpdated[0] == 0) {
        res.status(422).json({ message: 'customer loan details not updated' });
    } else {
        res.status(200).json({ message: 'customer loan details changed successfully' });
    }
}

//  FUNCTION FOR ADD PACKAGE IMAGES
exports.addPackageImagesForLoan = async (req, res, next) => {

    let { loanId, packageImageData } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let loanDetails = await models.customerLoan.getLoanDetailById(loanId);

    if (loanDetails !== null && loanDetails.loanUniqueId !== null && loanDetails.loanStatusForBM === 'confirmed') {
        let packageImageUploaded = await models.packageImageUploadForLoan.addPackageImages(
            loanId, packageImageData, createdBy, modifiedBy);
        res.status(201).json({ message: 'you have successfully uploaded package images' });
    } else {
        res.status(404).json({ message: 'given loan id is not proper' })
    }
}

//  FUNCTION FOR DISBURSEMENT OF LOAN AMOUNT
exports.disbursementOfLoanAmount = async (req, res, next) => {

    let { loanId, transactionId, date } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let loanDetails = await models.customerLoan.getLoanDetailById(loanId);

    if (loanDetails !== null && loanDetails.loanUniqueId !== null && loanDetails.loanStatusForBM === 'confirmed') {
        let loanAmountDisbursed = await models.disbursementOfLoan.disbursementOfLoanAmount(
            loanId, transactionId, date, createdBy, modifiedBy);
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
    let modifiedBy = req.userData.id;
    let loanUniqueId;

    if (applicationFormForBM === true && goldValuationForBM === true && loanStatusForBM === 'confirmed') {
        loanUniqueId = `LOAN${Math.floor(1000 + Math.random() * 9000)}`;
    } else {
        loanUniqueId = null;
    }
    let approvedByBM = await models.customerLoan.approvalFromBM(
        id, applicationFormForBM, goldValuationForBM, loanStatusForBM, loanUniqueId, modifiedBy
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
        },
        isActive: true
    };

    let associateModel = [{
        model: models.customer,
        as: 'customer',
        where: { isActive: true },
        attributes: { exclude: ['password'] }
    },
    {
        model: models.finalLoanCalculator,
        as: 'finalCalculator',
        where: { isActive: true }
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
        where: { customerUniqueId, isActive: true },
        attributes: ['id', 'customerUniqueId', 'panCardNumber', 'mobileNumber'],
        include: [{
            model: models.customerKyc,
            where: { kycStatus: 'approved' },
            as: 'customerKyc'
        },
        {
            model: models.customerKycPersonalDetail,
            // where: { isActive: true },
            as: 'customerKycPersonal',
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
            include: [{
                model: models.state,
                as: 'state'
            }, {
                model: models.city,
                as: 'city'
            }, {
                model: models.addressProofType,
                as: 'addressProofType'
            }]
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

//  FUNCTION FOR ADD PACKET
exports.addPacket = async (req, res, next) => {

    let { packetId } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let packetAdded = await models.packet.addPacket(
        packetId, createdBy, modifiedBy);
    res.status(201).json({ message: 'you adeed packet successfully' });
}

//  FUNCTION FOR VIEW PACKET
exports.viewPacket = async (req, res, next) => {
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let query = {};
    if (req.query.packetAssigned) {
        query.packetAssigned = req.query.packetAssigned;
    }
    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                "$loan.loan_unique_id$": { [Op.iLike]: search + '%' },
                "$customer.customer_unique_id$": { [Op.iLike]: search + '%' },
                packetId: { [Op.iLike]: search + '%' },
            },
        }],
        isActive: true,
    };

    let associateModel = [{
        model: models.customer,
        required: false,
        as: 'customer',
        where: { isActive: true },
        attributes: { exclude: ['password'] }
    },
    {
        model: models.customerLoan,
        required: false,
        as: 'loan',
        where: { isActive: true }
    }];

    let packetDetails = await models.packet.findAll({
        where: searchQuery,
        include: associateModel,
        order: [
            ['id', 'DESC']
        ],
        offset: offset,
        limit: pageSize,

    });
    let count = await models.packet.findAll({
        where: searchQuery,
        include: associateModel,
    });
    if (packetDetails.length === 0) {
        res.status(404).json({ message: 'no packet details found' });
    } else {
        res.status(200).json({ message: 'packet details fetch successfully', packetDetails, count: count.length });
    }
}

//  FUNCTION FOR GET AVAILABLE PACKET
exports.availablePacket = async (req, res, next) => {
    let availablePacketDetails = await models.packet.findAll({
        where: { isActive: true, packetAssigned: false },
    });
    if (availablePacketDetails.length === 0) {
        res.status(404).json({ message: 'no packet details found' });
    } else {
        res.status(200).json({ message: 'avalable packet details fetch successfully', availablePacketDetails });
    }
}


// FUNCTION TO ASSIGN PACKET
exports.assignPacket = async (req, res, next) => {
    let id = req.params.id;
    let { customerId, loanId } = req.body;
    let modifiedBy = req.userData.id;

    let packet = await models.packet.assignPacket(customerId, loanId, modifiedBy, id);

    if (packet[0] == 0) {
        return res.status(404).json({ message: "not assigned packet" });
    }
    return res.status(200).json({ message: "packet assigned successfully" });
};

// FUNCTION TO UPDATE PACKET
exports.changePacket = async (req, res, next) => {
    let id = req.params.id;
    let { packetId } = req.body;
    let modifiedBy = req.userData.id;

    let packet = await models.packet.updatePacket(id, packetId, modifiedBy);

    if (packet[0] == 0) {
        return res.status(404).json({ message: "packet not update" });
    }
    return res.status(200).json({ message: "packet updated successfully" });
};

// FUNCTION TO REMOVE PACKET
exports.deletePacket = async (req, res, next) => {
    let id = req.params.id;
    let modifiedBy = req.userData.id;

    let packet = await models.packet.removePacket(id, modifiedBy);

    if (packet[0] == 0) {
        return res.status(404).json({ message: "packet not delete" });
    }
    return res.status(200).json({ message: "packet deleted successfully" });
};
