const models = require('../../models'); // importing models.
const Sequelize = models.Sequelize;
const sequelize = models.sequelize;
const Op = Sequelize.Op;
const { getSingleLoanDetail } = require('../../utils/loanFunction')
const check = require("../../lib/checkLib");
const moment = require('moment')

exports.readBanner = async (req, res, next) => {
    console.log("banner")
    let banner = await models.banner.readBanner()
    if (!banner) {
        res.status(404).json({ message: 'Data not found' });
    } else {
        res.status(200).json({ data: banner[0] });
    }
};


exports.readOffer = async (req, res, next) => {
    let offer = await models.offer.readOffer()
    if (!offer[0]) {
        res.status(400).json({ message: 'Data not found' });
    } else {
        res.status(200).json({ data: offer[0] });
    }
};


exports.readLenderBanner = async (req, res, next) => {
    let lenderBanner = await models.lenderBanner.readLenderBanner()
    if (!lenderBanner[0]) {
        res.status(404).json({ message: 'Data not found' });
    } else {
        res.status(200).json({ data: lenderBanner[0] });
    }
};

exports.readGoldRate = async (req, res, next) => {
    let readGoldRate = await models.goldRate.findAll({ attributes: ['goldRate'] })
    if (!readGoldRate[0]) {
        res.status(404).json({ message: 'Data not found' });
    }
    else {
        res.status(200).json({ data: readGoldRate });
    }
}

exports.readPersonalDetailsOfCustomer = async (req, res, next) => {
    let customerId = req.userData.id;
    // console.log(customerId);
    let readPersonalDetailsOfCustomer = await models.customer.findOne({ attributes: ['firstName', 'lastName', 'email', 'panCardNumber', 'mobileNumber'], where: { id: customerId } });
    // console.log(readPersonalDetailsOfCustomer)
    if (!readPersonalDetailsOfCustomer) {
        res.status(404).json({ message: 'Data not found' })
    }
    else {
        res.status(200).json({ data: readPersonalDetailsOfCustomer });
    }

}

exports.readBankDetailsOfCustomer = async (req, res, next) => {
    let customerId = req.userData.id;
    let readBankDetailsOfCustomer = await models.customerKycBankDetail.findOne({ attributes: ['bankName', 'bankBranchName', 'accountHolderName', 'accountNumber', 'ifscCode'], where: { customerId: customerId } });
    // console.log(readBankDetailsOfCustomer)
    if (!readBankDetailsOfCustomer) {
        res.status(404).json({ message: 'Data not found' })
    }
    else {
        res.status(200).json({ data: readBankDetailsOfCustomer });
    }

}

exports.readNomineeDetailsOfCustomer = async (req, res, next) => {
    let customerId = req.userData.id;
    let readNomineeDetailsOfCustomer = await models.customerLoanNomineeDetail.findAll({ where: { customerId: customerId } });
    if (!readNomineeDetailsOfCustomer) {
        res.status(404).json({ message: 'Data not found' })
    }
    else {
        res.status(200).json({ data: readNomineeDetailsOfCustomer });
    }
}
exports.readAddressDetailsOfCustomer = async (req, res, next) => {
    let customerId = req.userData.id;
    let readAddressDetailsOfCustomer = await models.customerKycAddressDetail.findAll({ attributes: ['addressType', 'address', 'stateId', 'cityId', 'pinCode'], where: { customerId: customerId } });
    if (!readAddressDetailsOfCustomer) {
        res.status(404).json({ message: 'Data not found' })
    }
    else {
        res.status(200).json({ data: readAddressDetailsOfCustomer });
    }
}

exports.readPanCardImageOfCustomer = async (req, res, next) => {
    let customerId = req.userData.id;
    let readPanCardImageOfCustomer = await models.customerKycPersonalDetail.findOne({ attributes: ['identityProof'], where: { customerId: customerId } });
    if (!readPanCardImageOfCustomer) {
        res.status(404).json({ message: 'Data not found' });
    }
    else {
        res.status(200).json({ data: readPanCardImageOfCustomer });
    }
}

exports.readAddressImageOfCustomer = async (req, res, next) => {
    let customerId = req.userData.id;
    let readAddressImageOfCustomer = await models.customerKycAddressDetail.findOne({ attributes: ['addressProof'], where: { customerId: customerId } });
    if (!readAddressImageOfCustomer) {
        res.status(404).json({ message: 'Data not found' });
    }
    else {
        res.status(200).json({ data: readAddressImageOfCustomer });
    }
}

exports.readPartnerBranch = async (req, res, next) => {
    let id = req.params.id;
    console.log(id)
    let readPartner = await models.partnerBranch.findAll(
        {
            where: { cityId: id },
            attributes: ['id', 'name', 'address', 'cityId'],
            include: [{
                model: models.city,
                as: 'city'
            },

            {
                model: models.partner,
                as: "partner"
            }]

        });
    if (!readPartner[0]) {
        res.status(404).json({ message: 'Data not found' })
    }
    else {
        res.status(200).json({ data: readPartner });
    }
}
exports.readMyLoan = async (req, res, next) => {
    let customerId = req.userData.id;
    let stageId = await models.loanStage.findOne({ where: { name: 'disbursed' } })

    let loanDetails = await models.customerLoanMaster.findAll({
        where: { isActive: true, customerId: customerId, isLoanCompleted: true },
        order: [
            [models.customerLoan, 'id', 'asc'],
            [models.customerLoan, models.customerLoanInterest, 'id', 'asc']
        ],
        include: [
            {
                model: models.customerLoan,
                as: "customerLoan",
                include: [
                    {
                        model: models.scheme,
                        as: 'scheme'
                    },
                    {
                        model: models.customerLoanInterest,
                        as: 'customerLoanInterest',
                        where: { emiStatus: { [Op.notIn]: ['paid'] } },//isExtraDaysInterest: false
                    },

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
        ]
    });


    for (let i = 0; i < loanDetails.length; i++) {
        const element = loanDetails[i];
        let nextDueDate = null

        nextDueDate = await models.customerLoanInterest.findOne({

            where: {
                emiDueDate: { [Op.gte]: moment().format('YYYY-MM-DD') },
                masterLoanId: element.id
            },
            attributes: ['emiDueDate', 'emiStatus'],
            order: [['id', 'asc']]
        })

        if (nextDueDate) {
            element.dataValues.nextDueDate = nextDueDate.emiDueDate
            element.dataValues.status = nextDueDate.emiStatus
        } else {
            element.dataValues.nextDueDate = nextDueDate
            element.dataValues.status = nextDueDate
        }
    }

    return res.status(200).json({ data: loanDetails })
}

exports.readAllScheme = async (req, res, next) => {
    let getAllScheme = await models.scheme.findAll({ where: { isActive: true } });
    if (!getAllScheme[0]) {
        res.status(404).json({ message: 'Data not found' })
    }
    else {
        res.status(200).json({ data: getAllScheme })
    }
}

exports.readLoanDetails = async (req, res, next) => {
    let { customerLoanId, masterLoanId } = req.query

    let customerLoan = await getSingleLoanDetail(customerLoanId, masterLoanId)

    return res.status(200).json({ message: 'Success', data: customerLoan })
}

exports.schemeBasedOnPriceRange = async (req, res, next) => {
    const { schemeAmountStart, schemeAmountEnd } = req.query;
    var query = {};

    query.isActive = true;
    if (schemeAmountStart && schemeAmountEnd) {
        // AmountStart = parseInt(schemeAmountStart);
        // AmountEnd = parseInt(schemeAmountEnd);
        query = {
            [Op.and]: {
                schemeAmountStart: { [Op.gte]: schemeAmountStart },
                schemeAmountEnd: { [Op.lte]: schemeAmountEnd },
            }
        }
    }
    let schemeBasedOnPriceRange = await models.scheme.findAll({
        where: query
    });
    if (!schemeBasedOnPriceRange[0]) {
        return res.status(404).json({ message: 'Data not found' })
    }
    else {
        return res.status(200).json({ data: schemeBasedOnPriceRange });
    }
}

exports.readFeedBack = async (req, res) => {
    let readCustomerFeedBack = await models.feedBack.findAll({ attributes: ['customerName', 'feedBack', 'rating', 'profileImage'], where: { isActive: true } });

    if (!readCustomerFeedBack[0]) {
        return res.status(404).json({ message: 'Data not found' });
    }
    return res.status(200).json({ data: readCustomerFeedBack });
}

exports.addFeedBack = async (req, res) => {
    const { customerName, contactNumber, feedBack, rating } = req.body;
    await sequelize.transaction(async t => {
        let customerId = req.userData.id;
        // console.log(customerId)
        let customerPersonalDetails = await models.customerKycPersonalDetail.findOne({ where: { customerId: customerId }, transaction: t });
        // console.log(customerPersonalDetails)
        let profileImage = customerPersonalDetails.dataValues.profileImage;
        let addFeedBackData = await models.feedBack.create({ customerName, contactNumber, feedBack, rating, customerId, profileImage }, { transaction: t });
        if (!addFeedBackData) {
            return res.status(422).json({ message: 'Feedback is not created' });
        }
        return res.status(201).json({ message: 'Created' });
    })
}

exports.updatePassword = async (req, res, next) => {
    const { referenceCode, otp, newPassword } = req.body
    var todayDateTime = new Date();

    let verifyUser = await models.customerOtp.findOne({ where: { referenceCode, isVerified: true } })

    if (check.isEmpty(verifyUser)) {
        return res.status(400).json({ message: `INVALID OTP.` })
    }
    let user = await models.customer.findOne({ where: { mobileNumber: verifyUser.mobileNumber } });

    if (check.isEmpty(user)) {
        return res.status(404).json({ message: 'Customer not found.' });
    }
    let updatePassword = await user.update({ otp: null, password: newPassword }, { where: { id: user.dataValues.id } });
    if (updatePassword[0] == 0) {
        return res.status(400).json({ message: `Password update failed.` })
    }
    return res.status(200).json({ message: 'Password Updated.' });
}

exports.personalInfo = async (req, res, next) => {

    let { id } = req.userData

    let customerInfo = await models.cutomer.findOne({
        include: [
            {
                model: models.state,
                as: "state",
            },
            {
                model: models.module,
                as: "module",
            },
            {
                model: models.city,
                as: "city",
            },
        ]
    }, { where: { id: id } })

    return res.status(200).json({ message: 'Success', data: customerInfo })
}