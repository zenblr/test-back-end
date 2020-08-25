const models = require('../../models');
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION
const _ = require('lodash');

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
        },
        {
            model: models.customerPacketTracking,
            as: 'customerPacketTracking',
            include: [
                {
                    model: models.packetLocation,
                    as: 'packetLocation',
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                },
            ]
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
        order: [['id', 'DESC'],
        [models.customerLoan, 'id', 'asc'],
        [models.customerPacketTracking, 'id', 'desc']
        ],
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
    let { mobileNumber, receiverType } = req.query
    if (receiverType == 'InternalUser') {
        let User = await models.user.findOne({
            where: { mobileNumber: mobileNumber },
            attributes: ['id', 'firstName', 'lastName']
        });
        if (User) {
            return res.status(200).json({ data: User, receiverType });
        } else {
            return res.status(404).json({ message: 'Data not found!' });
        }
    } else if (receiverType == 'Customer') {
        let User = await models.customer.findOne({
            where: { mobileNumber: mobileNumber },
            attributes: ['id', 'firstName', 'lastName']
        });
        if (User) {
            return res.status(200).json({ data: User, receiverType });
        } else {
            return res.status(404).json({ message: 'Data not found!' });
        }
    } else if (receiverType == 'PartnerUser') {
        let User = await models.partnerBranchUser.findOne({
            where: { mobileNumber: mobileNumber },
            attributes: ['id', 'firstName', 'lastName']
        });
        if (User) {
            return res.status(200).json({ data: User, receiverType });
        } else {
            return res.status(404).json({ message: 'Data not found!' });
        }
    }

}

//FUNCTION TO GET LOGS OF PACKET TRACKING
exports.viewCustomerPacketTrackingLogs = async (req, res) => {
    let { masterLoanId, loanId } = req.query

    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let logDetails = await models.customerPacketTracking.findAll({
        where: { loanId: loanId, masterLoanId: masterLoanId },
        order: [
            ['id', 'DESC']
        ],
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
    //console.log(logDetails[0].dataValues)
    let receiverData = [];
    let senderData = [];
    let logDetail = [];
    let logData = [];

    if (logDetails.length != 0) {
        for (i = 0; i < logDetails.length; i++) {
            logDetail.push(logDetails[i].dataValues)
        }
        for (let log of logDetail) {
            senderData = [];
            receiverData = [];
            //console.log(log.packetLocation.location)
            if (log.senderUser != null) {
                senderData.push({
                    id: log.id,
                    firstName: log.senderUser.firstName,
                    lastName: log.senderUser.lastName,
                    location: log.packetLocation.location,
                    dateAndTime: log.updatedAt,
                    senderType: log.senderType
                })
            } else {
                senderData.push({
                    id: log.id,
                    firstName: log.senderPartner.firstName,
                    lastName: log.senderPartner.lastName,
                    location: log.packetLocation.location,
                    dateAndTime: log.updatedAt,
                    senderType: log.senderType
                })
            }
            if (log.customer != null) {
                receiverData.push({
                    id: log.id,
                    firstName: log.customer.firstName,
                    lastName: log.customer.lastName,
                    receiverType: log.receiverType,
                });
            } else if (log.receiverUser != null) {
                receiverData.push({
                    id: log.id,
                    firstName: log.receiverUser.firstName,
                    lastName: log.receiverUser.lastName,
                    receiverType: log.receiverType,
                });
            } else {
                receiverData.push({
                    id: log.id,
                    firstName: log.receiverPartner.firstName,
                    lastName: log.receiverPartner.lastName,
                    receiverType: log.receiverType,
                });
            }
            Object.assign(log, { senderData, receiverData })
        };
    }


    //console.log(logDetails)
    if (logDetail.length != 0) {
        return res.status(200).json({ data: logDetail });
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
        senderType = req.userData.userBelongsTo
        partnerSenderId = null
    } else if (req.userData.userBelongsTo === "partneruser") {
        partnerSenderId = req.userData.id
        senderType = req.userData.userBelongsTo
        userSenderId = null
    }

    let { customerReceiverId, userReceiverId, partnerReceiverId, receiverType, packetLocationId, loanId, masterLoanId } = req.body;

    let packetTrackingData = await models.customerPacketTracking.create({
        customerReceiverId, userReceiverId, partnerReceiverId, receiverType, loanId, masterLoanId, packetLocationId, userSenderId, partnerSenderId, senderType
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

