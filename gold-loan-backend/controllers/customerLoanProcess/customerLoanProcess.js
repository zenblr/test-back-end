// LOAD REQUIRED PACKAGES
const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION

const check = require("../../lib/checkLib"); // IMPORTING CHECKLIB 

//  FUNCTION FOR GET CUSTOMER DETAILS AFTER ENTER UNIQUE ID
exports.customerDetails = async (req, res, next) => {

    let customerUniqueId = req.params.customerUniqueId;
    let reqId = req.userData.id;
    let getAppraiserId = await models.customerAssignAppraiser.findOne({ where: { customerUniqueId } })

    if (check.isEmpty(getAppraiserId)) {
        return res.status(400).json({ message: 'This customer Did not assign in to anyone' })
    }
    if (reqId != getAppraiserId.appraiserId) {
        return res.status(400).json({ message: `This customer is not assign to you` })
    }

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


//  FUNCTION FOR LOAN APPLICATION FORM
exports.applyForLoanApplication = async (req, res, next) => {


    let { customerId, totalEligibleAmt, totalFinalInterestAmt, loanApproval, loanBank, loanOrnmanets, loanFinalCalculator, loanPersonal, loanKyc, loanNominee } = req.body

    let checkKycStatus = await models.customerKyc.findOne({ where: { customerId, kycStatus: "approved" } })
    if (check.isEmpty(checkKycStatus)) {
        return res.status(400).json({ message: `customer Kyc status is not approved` })
    }
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    //customerLoan
    let { applicationFormForAppraiser,
        goldValuationForAppraiser, loanStatusForAppraiser, commentByAppraiser } = loanApproval

    // customerLoanBank
    let { bankName, accountNumber, ifscCode } = loanBank

    // customerLoanKycAddress
    let { identityTypeId, identityProof, idCardNumber, permanentAddProofTypeId, permanentAddress, permanentAddStateId, permanentAddCityId, permanentAddPin, permanentAddProof, permanentAddCardNumber, residentialAddProofTypeId, residentialAddress, residentialAddStateId, residentialAddCityId, residentialAddPin, residentialAddProof, residentialAddCardNumber } = loanKyc

    //customerLoanNominee
    let { nomineeName, nomineeAge, relationship, nomineeType, guardianName, guardianAge, guardianRelationship } = loanNominee

    //customerFinalLoan
    let { partnerId, schemeId, finalLoanAmount, loanStartDate, tenure, loanEndDate, paymentFrequency, processingCharge, interestRate } = loanFinalCalculator

    //customerPersonal
    let { customerUniqueId, mobileNumber, panCardNumber, startDate } = loanPersonal

    //customerLoanOrnamanetsDetails
    // console.log(loanOrnmanets)

    let appliedForLoanApplication = await sequelize.transaction(async t => {
        // customerLoan
        let customerLoanCreated = await models.customerLoan.create({
            customerId, applicationFormForAppraiser,
            goldValuationForAppraiser, loanStatusForAppraiser, commentByAppraiser, totalEligibleAmt, totalFinalInterestAmt, createdBy, modifiedBy
        }, { transaction: t })
        let loanId = customerLoanCreated.id;

        // customerLoanBank
        await models.customerLoanBankDetail.create({
            loanId, bankName, accountNumber, ifscCode, createdBy, modifiedBy
        }, { transaction: t });

        //customerLoanKycAddress
        await models.customerLoanKycDetail.create({
            loanId, identityTypeId, identityProof, idCardNumber, permanentAddProofTypeId, permanentAddress, permanentAddStateId, permanentAddCityId, permanentAddPin, permanentAddProof,
            permanentAddCardNumber, residentialAddProofTypeId, residentialAddress, residentialAddStateId, residentialAddCityId, residentialAddPin, residentialAddProof,
            residentialAddCardNumber, createdBy, modifiedBy
        }, { transaction: t });

        //customerLoanNominee
        await models.customerLoanNomineeDetail.create({
            loanId, nomineeName, nomineeAge, relationship, nomineeType, guardianName, guardianAge, guardianRelationship, createdBy, modifiedBy
        }, { transaction: t });

        //customerPersonalData
        await models.customerLoanPersonalDetail.create({
            loanId, customerUniqueId, mobileNumber, panCardNumber, startDate, createdBy, modifiedBy
        }, { transaction: t });

        //customerFinalLoan
        await models.customerFinalLoan.create({
            loanId, partnerId, schemeId, finalLoanAmount, loanStartDate, tenure, loanEndDate, paymentFrequency, processingCharge, interestRate, createdBy, modifiedBy
        }, { transaction: t })

        let allOrnmanets = []
        for (let i = 0; i < loanOrnmanets.length; i++) {
            loanOrnmanets[i]['createdBy'] = createdBy
            loanOrnmanets[i]['modifiedBy'] = modifiedBy
            loanOrnmanets[i]['loanId'] = loanId
            allOrnmanets.push(loanOrnmanets[i])
        }

        //customerOrnamentDetails
        await models.customerLoanOrnamentsDetail.bulkCreate(allOrnmanets, { transaction: t });

    })


    return res.status(201).json({ message: 'you have successfully applied for the loan' });
}


//get single customer loan details
exports.getSingleLoanDetails = async (req, res, next) => {

    let { customerLoanId } = req.query

    let customerLoan = await models.customerLoan.findOne({
        where: { id: customerLoanId },
        attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
        include: [
            {
                model: models.customerLoanPersonalDetail,
                as: 'loanPersonalDetail',
                attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] }
            }, {
                model: models.customerLoanBankDetail,
                as: 'loanBankDetail',
                where: { isActive: true },
                attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] }
            },
            {
                model: models.customerLoanKycDetail,
                as: 'loanKycDetail',
                where: { isActive: true },
                attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                include: [
                    {
                        model: models.identityType,
                        as: 'identityType',
                        attributes: ['id', 'name']
                    },
                    {
                        model: models.state,
                        as: 'perState',
                        attributes: ['id', 'name']
                    },
                    {
                        model: models.city,
                        as: 'perCity',
                        attributes: ['id', 'name']
                    },
                    {
                        model: models.addressProofType,
                        as: 'perAddressProofType',
                        attributes: ['id', 'name']
                    },
                    {
                        model: models.state,
                        as: 'resState',
                        attributes: ['id', 'name']
                    },
                    {
                        model: models.city,
                        as: 'resCity',
                        attributes: ['id', 'name']
                    },
                    {
                        model: models.addressProofType,
                        as: 'resAddressProofType',
                        attributes: ['id', 'name']
                    },
                ]
            },
            {
                model: models.customerLoanNomineeDetail,
                as: 'loanNomineeDetail',
                where: { isActive: true },
                attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] }
            },
            {
                model: models.customerLoanOrnamentsDetail,
                as: 'loanOrnamentsDetail',
                where: { isActive: true },
                attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] }
            },
            {
                model: models.customerFinalLoan,
                as: 'finalLoan',
                where: { isActive: true },
                attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] }
            }
        ]
    })

    return res.status(200).json({ message: 'success', data: customerLoan })
}

//  FUNCTION TO UPDATE CUSTOMER ORNAMENTS DETAILS
exports.updateCustomerLoanDetail = async (req, res, next) => {
    let { totalEligibleAmt, totalFinalInterestAmt, loanApproval, loanOrnmanets, loanFinalCalculator, loanNominee } = req.body;
    let loanId = req.params.loanId;
    let modifiedBy = req.userData.id;

    //customerFinalLoan
    let { partnerId, schemeId, finalLoanAmount, loanStartDate, tenure, loanEndDate, paymentFrequency, processingCharge, interestRate } = loanFinalCalculator

    //customerLoanNominee
    let { nomineeName, nomineeAge, relationship, nomineeType, guardianName, guardianAge, guardianRelationship } = loanNominee

    //customerLoan
    let { applicationFormForAppraiser,
        goldValuationForAppraiser, loanStatusForAppraiser, commentByAppraiser, applicationFormForBM, goldValuationForBM, loanStatusForBM, commentByBM } = loanApproval
    let cutomerLoanApproval = {}
    if (req.userData.roleName[0] == "Appraiser") {
        cutomerLoanApproval['applicationFormForAppraiser'] = applicationFormForAppraiser
        cutomerLoanApproval['goldValuationForAppraiser'] = goldValuationForAppraiser
        cutomerLoanApproval['loanStatusForAppraiser'] = loanStatusForAppraiser
        cutomerLoanApproval['commentByAppraiser'] = commentByAppraiser
        cutomerLoanApproval['totalEligibleAmt'] = totalEligibleAmt
        cutomerLoanApproval['totalFinalInterestAmt'] = totalFinalInterestAmt
        cutomerLoanApproval['modifiedBy'] = modifiedBy
    }

    if (req.userData.roleName[0] == "Branch Manager") {
        var loanUniqueId = null;
        if (loanStatusForBM === 'approved') {
            if (applicationFormForBM == true && goldValuationForBM == true) {
                loanUniqueId = `LOAN${Math.floor(1000 + Math.random() * 9000)}`;
            } else {
                return res.status(400).json({ message: `One of field is not verified` })
            }
        }
        // if (applicationFormForBM === true && goldValuationForBM === true && loanStatusForBM === 'approved') {
        //     loanUniqueId = `LOAN${Math.floor(1000 + Math.random() * 9000)}`;
        // } else {
        //     loanUniqueId = null;
        // }
        cutomerLoanApproval['applicationFormForBM'] = applicationFormForBM
        cutomerLoanApproval['goldValuationForBM'] = goldValuationForBM
        cutomerLoanApproval['loanStatusForBM'] = loanStatusForBM
        cutomerLoanApproval['commentByBM'] = commentByBM
        cutomerLoanApproval['totalEligibleAmt'] = totalEligibleAmt
        cutomerLoanApproval['totalFinalInterestAmt'] = totalFinalInterestAmt
        cutomerLoanApproval['modifiedBy'] = modifiedBy
        cutomerLoanApproval['loanUniqueId'] = loanUniqueId
    }

    let updateLoanApplication = await sequelize.transaction(async t => {

        // customerLoan
        await models.customerLoan.update(cutomerLoanApproval, { where: { id: loanId }, transaction: t })
        //customerLoanNominee
        await models.customerLoanNomineeDetail.update({
            nomineeName, nomineeAge, relationship, nomineeType, guardianName, guardianAge, guardianRelationship, modifiedBy
        }, { where: { loanId }, transaction: t });

        //customerFinalLoan
        await models.customerFinalLoan.update({
            partnerId, schemeId, finalLoanAmount, loanStartDate, tenure, loanEndDate, paymentFrequency, processingCharge, interestRate, modifiedBy
        }, { where: { loanId }, transaction: t })


        let allOrnmanets = []
        for (let i = 0; i < loanOrnmanets.length; i++) {
            loanOrnmanets[i]['modifiedBy'] = modifiedBy
            loanOrnmanets[i]['loanId'] = loanId
            allOrnmanets.push(loanOrnmanets[i])
        }

        let d = await models.customerLoanOrnamentsDetail.bulkCreate(allOrnmanets, {
            updateOnDuplicate: ["loanId", "ornamentType", "quantity", "grossWeight", "netWeight", "deductionWeight", "ornamentImage", "weightMachineZeroWeight", "withOrnamentWeight", "stoneTouch", "acidTest", "karat", "purity", "ltvRange", "purityTest", "ltvPercent", "ltvAmount", "loanAmount", "finalNetWeight", "currentLtvAmount"]
        }, { transaction: t })

    })
    return res.status(200).json({ message: 'success' });

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
            appraiser_status: sequelize.where(
                sequelize.cast(sequelize.col("customerLoan.loan_status_for_appraiser"), "varchar"),
                {
                    [Op.iLike]: search + "%",
                }
            ),
            bm_status: sequelize.where(
                sequelize.cast(sequelize.col("customerLoan.loan_status_for_bm"), "varchar"),
                {
                    [Op.iLike]: search + "%",
                }
            )
        },
        isActive: true
    };

    let associateModel = [{
        model: models.customer,
        as: 'customer',
        where: { isActive: true },
        attributes: ['id', 'firstName', 'lastName', 'panCardNumber', 'customerUniqueId', 'mobileNumber']
    },
    {
        model: models.customerFinalLoan,
        as: 'finalLoan',
        where: { isActive: true },
        attributes: ['loanStartDate'],
        include: [{
            model: models.scheme,
            as: 'scheme',
            attributes: ['id', 'schemeName']
        }]
    }]

    let appliedLoanDetails = await models.customerLoan.findAll({
        where: searchQuery,
        include: associateModel,
        attributes: ['id', 'loanStatusForAppraiser', 'loanStatusForBM'],
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

