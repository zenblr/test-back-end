const models = require('../../models');
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION

//FUNCTION TO GET ALL PACKET DETAILS
exports.getAllPacketTrackingDetail = async (req, res, next) => {
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let query = {};
    let associateModel = [
        {
            model: models.customerLoan,
            as: 'customerLoan',
            attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
        },
        {
            model: models.customerLoanPackageDetails,
            as: 'loanPacketDetails',
            attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
            include: [{
                model: models.packet,
                attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                include: [
                    {
                        model: models.internalBranch,
                        as: 'internalBranch',
                        where: { isActive: true },
                        attributes: ['id', 'internalBranchUniqueId', 'name']
                    },
                    {
                        model: models.user,
                        as: 'appraiser',
                        attributes: ['id', 'firstName', 'lastName']
                    }
                ]
            }]
        },
        {
            model: models.customer,
            as: 'customer',
            attributes: ['id', 'customerUniqueId', 'firstName', 'lastName'],
        }
    ]
    let stageId = await models.loanStage.findOne({ where: { name: 'disbursed' } })
    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                "$customerLoan.loan_unique_id$": { [Op.iLike]: search + '%' },
                "$loanPacketDetails.packets.internalBranch.name$": { [Op.iLike]: search + '%' },
                "$customer.first_name$": { [Op.iLike]: search + '%' },
                "$customer.last_name$": { [Op.iLike]: search + '%' },
                "$customer.customer_unique_id$": { [Op.iLike]: search + '%' },
            },
        }],
        isActive: true,
        loanStageId: stageId.id
    };
    let packetDetails = await models.customerLoanMaster.findAll({
        attributes: ['id'],
        where: searchQuery,
        subQuery: false,
        include: associateModel,
        order: [[models.customerLoan, 'id', 'asc']],
        offset: offset,
        limit: pageSize,
    });
    let count = await models.customerLoanMaster.findAll({
        include: associateModel,
        where: searchQuery,
        subQuery: false,
        offset: offset,
        limit: pageSize,
    });
    return res.status(200).json({ message: 'packet details fetched successfully', data: packetDetails, count: count.length });
}

//FUNCTION TO GET DETAILS OF PACKET OF SINGLE CUSTOMER FOR APP ALSO
exports.viewPackets = async (req, res) => {

    let { masterLoanId } = req.query
    let data = await models.customerLoanPackageDetails.findAll({
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

    return res.status(200).json({ data: data });
}

//FUNCTION TO CHECK BARCODE 
exports.checkBarcode = async (req, res) => {
    let { packetId, Barcode } = req.query
    let isMatched = await models.packet.findOne({
        where: { packetUniqueId: packetId, barcodeNumber: Barcode }
    })
    if (isMatched) {
        return res.status(200).json({ message: 'Barcode Matched' })
    } else {
        return res.status(400).json({ message: 'Barcode doesn\'t Matched!' })
    }
}

//FUNCTION TO GET USER NAME
exports.getUserName = async (req, res) => {
    let { mobileNumber, isSelected } = req.query
    if (isSelected == 'InternalUser') {
        let User = await models.user.findOne({
            where: { mobileNumber: mobileNumber },
            attributes: ['id', 'firstName', 'lastName']
        });
        if (User) {
            return res.status(200).json({ data: User });
        } else {
            return res.status(400).json({ message: 'Data not found!' });
        }
    } else if (isSelected == 'Customer') {
        let User = await models.customer.findOne({
            where: { mobileNumber: mobileNumber },
            attributes: ['id', 'firstName', 'lastName']
        });
        if (User) {
            return res.status(200).json({ data: User });
        } else {
            return res.status(400).json({ message: 'Data not found!' });
        }
    } else {
        return res.status(400).json([]);
    }

}

//FUNCTION TO GET LOGS OF PACKET TRACKING
exports.viewCustomerPacketTrackingLogs = async (req, res) => {
    let { masterLoanId, loanId } = req.query

    let { offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.from, req.query.to);

    let logDetails = await models.customerPacketTracking.findAll({
        where: { loanId: loanId, masterLoanId: masterLoanId },
        include: [
            {
                model: models.packetLocation,
                as: 'packetLocation',
                attributes: { exclude: ['createdAt', 'updatedAt'] },
            },
            {
                model: models.user,
                as: 'senderUser',
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: models.customer,
                as: 'customer',
                attributes: ['id', 'customerUniqueId', 'firstName', 'lastName'],
            },
            {
                model: models.user,
                as: 'receiverUser',
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: models.partnerBranchUser,
                as: 'senderPartner',
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: models.partnerBranchUser,
                as: 'receiverPartner',
                attributes: ['id', 'firstName', 'lastName']
            }
        ],
        offset: offset,
        limit: pageSize,
    });
    let logData = []
    let receiverData = [];
    let senderData = [];
    if (logDetails.length != 0) {
        for (let logDetail of logDetails) {
            console.log(logDetail)
            if (logDetail.senderUser != null) {
                senderData.push({
                    firstName: logDetail.senderUser.firstName,
                    lastName: logDetail.senderUser.lastName,
                    dateAndTime: logDetail.updatedAt
                })
            } else {
                senderData.push({
                    firstName: logDetail.senderPartner.firstName,
                    lastName: logDetail.senderPartner.lastName,
                    dateAndTime: logDetail.updatedAt
                })
            }
            if (logDetail.customer != null) {
                receiverData.push({
                    firstName: logDetail.customer.firstName,
                    lastName: logDetail.customer.lastName,
                    dateAndTime: logDetail.updatedAt
                });
            } else if (logDetail.receiverUser != null) {
                receiverData.push({
                    firstName: logDetail.receiverUser.firstName,
                    lastName: logDetail.receiverUser.lastName,
                    dateAndTime: logDetail.updatedAt
                });
            } else {
                receiverData.push({
                    firstName: logDetail.receiverPartner.firstName,
                    lastName: logDetail.receiverPartner.lastName,
                    dateAndTime: logDetail.updatedAt
                });
            }
        };
    }
    logData.push({
        receiverData,
        senderData,
    })
    console.log(receiverData.dateAndTime, 'receiver')
    //console.log(logData)
    if (logDetails) {
        return res.status(200).json({ data: logData });
    }
    else {
        return res.status(404).json({ message: 'Data not found!' });
    }

}

//FUNCTION TO UPDATE  LOCATION IN PACKET TRACKING 
exports.addCustomerPacketTracking = async (req, res) => {
    //console.log(req.userData.userBelongsTo)
    if (req.userData.userBelongsTo === "internaluser") {
        userSenderId = req.userData.id
        partnerSenderId = null
    } else if (req.userData.userBelongsTo === "partneruser") {
        partnerSenderId = req.userData.id
        userSenderId = null
    }

    let { customerReceiverId, userReceiverId, partnerReceiverId, receiverType, packetLocationId, loanId, masterLoanId } = req.body;

    let packetTrackingData = await models.customerPacketTracking.create({
        customerReceiverId, userReceiverId, partnerReceiverId, receiverType, loanId, masterLoanId, packetLocationId, userSenderId, partnerSenderId
    });

    if (packetTrackingData) {
        return res.status(201).json({ message: 'Loaction Added' });
    } else {
        return res.status(400).json({ message: 'Loaction not added' });
    }
}

exports.addPacketLocation = async (req, res) => {

    let { latitude, longitude, appraiserId, packetId, masterLoanId, customerLoanId, packetLocationId } = req.body

    let packetlocation = await models.packetTracking.create({ latitude, longitude, appraiserId, packetId, masterLoanId, customerLoanId, packetLocationId })

    if (packetlocation) {
        return res.status(200).json({ message: success })
    }
}

exports.getMapDetails = async (req, res, next) => {

    let internalBranch = req.userData.internalBranchId

    let appraiser = await models.user.findAll({ where: { userTypeId: 7, } })

}

exports.getLocationDetails = async (req, res, next) => {

}

