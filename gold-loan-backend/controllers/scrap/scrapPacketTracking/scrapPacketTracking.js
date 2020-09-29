const models = require('../../../models');
const Sequelize = models.Sequelize;
const sequelize = models.sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../../utils/pagination'); // IMPORTING PAGINATION FUNCTION
const _ = require('lodash');
const check = require("../../../lib/checkLib"); // IMPORTING CHECKLIB 
const moment = require('moment')
const { paginationWithFromTo } = require("../../../utils/pagination");
const CONSTANT = require('../../../utils/constant');
const { createReferenceCode } = require("../../../utils/referenceCode");
const request = require("request");

//FUNCTION TO CHECK BARCODE 
exports.checkBarcode = async (req, res) => {
    let { packetId, Barcode } = req.query
    let isMatched = await models.scrapPacket.findOne({
        where: { id: packetId, barcodeNumber: Barcode }
    })
    if (isMatched) {
        return res.status(200).json({ message: 'Barcode Matched' })
    } else {
        return res.status(400).json({ message: 'Barcode doesn\'t Matched!' })
    }
}

exports.viewPackets = async (req, res) => {

    let { scrapId } = req.query
    let data = await models.customerScrapPackageDetails.findAll({
        where: { scrapId: scrapId },
        include: [{
            model: models.scrapPacket,
            as: 'customerScrapPackageDetailId',
            include: [{
                model: models.scrapPacketOrnament,
                as: 'scrapPacketOrnament',
                include: [{
                    model: models.ornamentType,
                    as: 'ornamentType'
                }]
            }]
        }]
    })

    return res.status(200).json({ data: data });
}

//FUNCTION TO GET USER NAME
exports.getUserName = async (req, res) => {
    let { mobileNumber, receiverType, scrapId } = req.query;

    let customerScrap = await models.customerScrap.findOne({ where: { id: scrapId } })
    if (receiverType == 'InternalUser') {
        let User = await models.user.findOne({
            where: { mobileNumber: mobileNumber },
            attributes: ['id', 'firstName', 'lastName'],
            include: [
                {
                    model: models.internalBranch,
                    where: { id: customerScrap.internalBranchId },
                    attributes: ['id']
                }
            ]
        });
        if (User) {
            return res.status(200).json({ data: User, receiverType });
        } else {
            return res.status(404).json({ message: 'User not found!' });
        }
    } else {
        return res.status(404).json({ message: 'User not found!' });
    }
}

exports.checkOutPacket = async (req, res, next) => {
    let { customerId } = req.query

    let custDetail = await models.customer.findOne({ where: { id: customerId } })

    await models.customerOtp.destroy({ where: { mobileNumber: custDetail.mobileNumber } });

    const referenceCode = await createReferenceCode(5);
    // let otp = Math.floor(1000 + Math.random() * 9000);
    let otp = 1234;
    let createdTime = new Date();
    let expiryTime = moment.utc(createdTime).add(10, "m");

    // var expiryTimeToUser = moment(moment.utc(expiryTime).toDate()).format('YYYY-MM-DD HH:mm');

    await models.customerOtp.create({ mobileNumber: custDetail.mobileNumber, otp, createdTime, expiryTime, referenceCode, });

    request(`${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${custDetail.mobileNumber}&source=nicalc&message=For refrence code ${referenceCode} your OTP is ${otp}. This otp is valid for only 10 minutes`);

    return res.status(200).json({ message: `success`, referenceCode: referenceCode })
}

exports.verifyCheckOut = async (req, res, next) => {

    let { referenceCode, otp, sacrpId } = req.body
    let id = req.userData.id
    let internalBranchId = req.userData.internalBranchId

    var todayDateTime = new Date();
    let verifyUser = await models.customerOtp.findOne({
        where: {
            referenceCode,
            otp,
            expiryTime: {
                [Op.gte]: todayDateTime,
            },
        },
    });
    if (check.isEmpty(verifyUser)) {
        return res.status(404).json({ message: `INVALID OTP.` });
    }

    let verifyFlag = await models.customerOtp.update(
        { isVerified: true },
        { where: { id: verifyUser.id } }
    );

    let scrapStage = await models.scrapStage.findOne({ where: { name: 'submit packet' } })

    let packetLocation = await models.packetLocation.findOne({ where: { location: 'branch in' } });

    // console.log(req.useragent)
    // let packetLocation
    // if (req.useragent.isMobile) {
    //     packetLocation = await models.packetLocation.findOne({ where: { location: 'customer home out' } });
    // } else {
    //     packetLocation = await models.packetLocation.findOne({ where: { location: 'customer check out' } });
    // }

    await sequelize.transaction(async (t) => {

        await models.customerScrap.update({ scrapStageId: scrapStage.id }, { where: { id: sacrpId }, transaction: t })

        await models.customerScrapPacketData.create({ scrapId: scrapId, packetLocationId: packetLocation.id }, { transaction: t });

        await models.scrapCustomerPacketTracking.create({ scrapId, internalBranchId: internalBranchId, packetLocationId: packetLocation.id, userSenderId: id, isDelivered: true }, { transaction: t });
    })

    return res.status(200).json({ message: 'success' })

}

exports.submitScrapPacketLocation = async (req, res, next) => {

    let { internalBranchId, userReceiverId, receiverType, packetLocationId, scrapId } = req.body

    if (req.userData.userBelongsTo === "InternalUser") {
        userSenderId = req.userData.id
        senderType = req.userData.userBelongsTo
    }

    let verifyUser
    var todayDateTime = new Date();

    let { location } = await models.packetLocation.findOne({ where: { id: packetLocationId } });
    if (location == "branch in") {
        let scrapStage = await models.scrapStage.findOne({ where: { name: 'packet in branch' } })

        await sequelize.transaction(async (t) => {

            await models.customerScrap.update({ scrapStageId: scrapStage.id, isScrapCompleted: true }, { where: { id: scrapId }, transaction: t });

            await models.customerScrapPacketData.create({ scrapId: scrapId, packetLocationId: packetLocationId }, { transaction: t });

            let packetTrackingData = await models.scrapCustomerPacketTracking.create({
                internalBranchId, userReceiverId, receiverType, scrapId, packetLocationId, userSenderId, senderType, isDelivered: true
            }, { transaction: t });

            let allPacketTrackingData = await models.scrapCustomerPacketTracking.findAll({
                where: { scrapId: scrapId, isDelivered: true },
                transaction: t,
                order: [['id', 'desc']]
            })

            var processingTime = moment.utc(moment(packetTrackingData.updatedAt, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(allPacketTrackingData[allPacketTrackingData.length - 1].updatedAt, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")

            await models.scrapCustomerPacketTracking.update({ processingTime: processingTime }, { where: { id: packetTrackingData.id }, transaction: t });

        })
    }

    return res.status(200).json({ message: `packet location submitted` })

}

//FUNCTION TO UPDATE  LOCATION IN PACKET TRACKING 
exports.addCustomerPacketTracking = async (req, res, next) => {
    //console.log(req.userData.userBelongsTo)

    let senderInternalBranch = req.userData.internalBranchId
    if (req.userData.userBelongsTo === "InternalUser") {
        userSenderId = req.userData.id
        senderType = req.userData.userBelongsTo
    }
    let { deliveryPacketLocationId, userReceiverId, receiverType, packetLocationId, scrapId, courier, podNumber } = req.body;

    let { location } = await models.packetLocation.findOne({ where: { id: deliveryPacketLocationId } });

    let customerScrap = await models.customerScrap.findOne({ where: { id: scrapId } })

    let deliveryReceiverType;
    if (location == 'branch in') {
        deliveryReceiverType = 'InternalUser'
    }

    let verifyUser
    var todayDateTime = new Date();
    switch (receiverType) {
        //     case "Customer":
        //         verifyUser = await models.customerOtp.findOne({
        //             where: {
        //                 referenceCode,
        //                 otp,
        //                 expiryTime: {
        //                     [Op.gte]: todayDateTime,
        //                 },
        //             },
        //         });
        //         if (check.isEmpty(verifyUser)) {
        //             return res.status(404).json({ message: `INVALID OTP.` });
        //         }
        //         break;
        //     case "InternalUser":
        //         verifyUser = await models.userOtp.findOne({
        //             where: {
        //                 referenceCode, otp,
        //                 expiryTime: {
        //                     [Op.gte]: todayDateTime
        //                 }
        //             }
        //         })
        //         if (check.isEmpty(verifyUser)) {
        //             return res.status(400).json({ message: `INVALID OTP.` })
        //         }
        //         break;
        //     case "PartnerUser":
        //         verifyUser = await models.partnerBranchOtp.findOne({
        //             where: {
        //                 referenceCode, otp,
        //                 expiryTime: {
        //                     [Op.gte]: todayDateTime
        //                 }
        //             }
        //         })
        //         if (check.isEmpty(verifyUser)) {
        //             return res.status(400).json({ message: `INVALID OTP.` })
        //         }
        //         break;
    }

    await sequelize.transaction(async (t) => {

        // let partnerBranchInLocation = await models.packetLocation.findOne({ where: { location: 'partner branch in' }, transaction: t })
        let packetInBranch = await models.scrapStage.findOne({ where: { name: 'packet in branch' }, transaction: t })
        let packetSubmitted = await models.scrapStage.findOne({ where: { name: 'packet submitted' }, transaction: t })

        if (customerScrap.scrapStageId == packetInBranch.id) {
            // if (packetLocationId == partnerBranchInLocation.id) {
            await models.customerScrap.update({ scrapStageId: packetSubmitted.id, isScrapCompleted: true }, { where: { id: masterLoanId }, transaction: t })
            // }
        }

        await models.customerScrapPacketData.create({ scrapId: scrapId, packetLocationId: packetLocationId }, { transaction: t })

        let packetTrackingData = await models.scrapCustomerPacketTracking.create({
            internalBranchId: senderInternalBranch, userReceiverId, receiverType, scrapId, packetLocationId, userSenderId, senderType, isDelivered: true, courier, podNumber
        }, { transaction: t });

        let allPacketTrackingData = await models.scrapCustomerPacketTracking.findAll({
            where: { scrapId: scrapId, isDelivered: true },
            transaction: t,
            order: [['id', 'desc']]
        })

        var processingTime = moment.utc(moment(packetTrackingData.updatedAt, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(allPacketTrackingData[allPacketTrackingData.length - 1].updatedAt, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")

        await models.scrapCustomerPacketTracking.update({ processingTime: processingTime }, { where: { id: packetTrackingData.id }, transaction: t });

    })

    return res.status(200).json({ message: 'Location Added' });

}

//FUNCTION TO GET ALL PACKET DETAILS
exports.getAllPacketTrackingDetail = async (req, res, next) => {
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let query = {};
    let associateModel = [

        {
            model: models.customerScrapPackageDetails,
            as: 'scrapPacketDetails',
            attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
            include: [{
                model: models.scrapPacket,
                as: "CustomerScrapPackageDetail",
                attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
            }]
        },
        {
            model: models.user,
            as: 'Createdby',
            attributes: ['id', 'firstName', 'lastName']
        },
        {
            model: models.internalBranch,
            as: 'internalBranch',
            attributes: ['id', 'internalBranchUniqueId', 'name']
        },
        {
            model: models.customer,
            as: 'customer',
            attributes: ['id', 'customerUniqueId', 'firstName', 'lastName', 'mobileNumber'],
        },
        {
            model: models.customerScrapPacketData,
            as: 'locationData',
            include: [
                {
                    model: models.scrapPacketLocation,
                    as: 'scrapPacketLocation',
                    attributes: ['id', 'location']
                }
            ]
        },
    ];

    // if (req.query.paymentType) {
    //     query["$paymentType.id$"] = await req.query.paymentType.split(',');
    // }

    let stage = await models.scrapStage.findAll({ where: { name: { [Op.in]: ['submit packet', 'packet in branch', 'packet submitted'] } } })
    let stageId = stage.map(ele => ele.id)

    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                "$customer.mobile_number$": { [Op.iLike]: search + "%" },
                "$customerScrap.scrap_unique_id$": { [Op.iLike]: search + '%' },
                "$customer.first_name$": { [Op.iLike]: search + '%' },
                "$customer.last_name$": { [Op.iLike]: search + '%' },
                "$customer.customer_unique_id$": { [Op.iLike]: search + '%' },
            },
        }],
        isActive: true,
        scrapStageId: stageId
    };
    let packetDetails = await models.customerScrap.findAll({
        where: searchQuery,
        include: associateModel,
        attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
        order: [
            ['id', 'DESC'],
            [{ model: models.customerScrapPacketData, as: 'locationData' }, 'id', 'asc']
        ],
        subQuery: false,
        offset: offset,
        limit: pageSize,
    });

    let count = await models.customerScrap.findAll({
        include: associateModel,
        where: searchQuery,
        // subQuery: false,
    });
    return res.status(200).json({ message: 'packet details fetched successfully', data: packetDetails, count: count.length });
}

//FUNCTION TO GET LOGS OF PACKET TRACKING
exports.viewCustomerPacketTrackingLogs = async (req, res) => {
    let { scrapId } = req.query

    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let searchQuery = {
        scrapId: scrapId,
        isDelivered: true
    }

    let includeArray = [
        {
            model: models.scrapPacketLocation,
            as: 'packetLocation',
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
        {
            model: models.user,
            as: 'senderUser',
            attributes: ['id', 'firstName', 'lastName']
        },
        // {
        //     model: models.customer,
        //     as: 'customer',
        //     attributes: ['id', 'customerUniqueId', 'firstName', 'lastName'],
        // },
        {
            model: models.user,
            as: 'receiverUser',
            attributes: ['id', 'firstName', 'lastName']
        },
        // {
        //     model: models.partnerBranchUser,
        //     as: 'senderPartner',
        //     attributes: ['id', 'firstName', 'lastName']
        // },
        // {
        //     model: models.partnerBranchUser,
        //     as: 'receiverPartner',
        //     attributes: ['id', 'firstName', 'lastName']
        // },
        {
            model: models.internalBranch,
            as: 'internalBranch'
        },
        // {
        //     model: models.partnerBranch,
        //     as: 'partnerBranch',
        //     include: [
        //         {
        //             model: models.partner,
        //             as: 'partner'
        //         }
        //     ]
        // }
    ]

    let logDetails = await models.scrapCustomerPacketTracking.findAll({
        where: searchQuery,
        order: [
            ['id', 'DESC']
        ],
        include: includeArray,
        offset: offset,
        limit: pageSize,
    });
    //console.log(logDetails[0].dataValues)
    let receiverData = [];
    let senderData = [];
    let logDetail = [];

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
            } 
            // else if (log.senderPartner != null) {
            //     senderData.push({
            //         id: log.id,
            //         firstName: log.senderPartner.firstName,
            //         lastName: log.senderPartner.lastName,
            //         location: log.packetLocation.location,
            //         dateAndTime: log.updatedAt,
            //         senderType: log.senderType
            //     })
            // }
            // if (log.customer != null) {
            //     receiverData.push({
            //         id: log.id,
            //         firstName: log.customer.firstName,
            //         lastName: log.customer.lastName,
            //         receiverType: log.receiverType,
            //     });
            // }
            if (log.receiverUser != null) {
                receiverData.push({
                    id: log.id,
                    firstName: log.receiverUser.firstName,
                    lastName: log.receiverUser.lastName,
                    receiverType: log.receiverType,
                });
            }
            // else if (log.receiverPartner != null) {
            //     receiverData.push({
            //         id: log.id,
            //         firstName: log.receiverPartner.firstName,
            //         lastName: log.receiverPartner.lastName,
            //         receiverType: log.receiverType,
            //     });
            // }
            Object.assign(log, { senderData, receiverData })
        };
    }


    let count = await models.scrapCustomerPacketTracking.findAll({
        where: searchQuery,
        order: [
            ['id', 'DESC']
        ],
        include: includeArray

    });


    if (logDetail.length != 0) {
        return res.status(200).json({ data: logDetail, count: count.length });
    }
    else {
        return res.status(404).json({ message: 'Data not found!' });
    }

}

exports.getNextPacketLoaction = async (req, res, next) => {
    let { scrapId } = req.query

    let packetTrackingData = await models.scrapCustomerPacketTracking.findAll({
        where: { scrapId: scrapId, isDelivered: true },
        order: [['id', 'desc']]
    })

    let locationId = packetTrackingData[0].packetLocationId

    let { location } = await models.packetLocation.findOne({ where: { id: locationId } });

    let locationData;

    if (location == 'branch in') {
        locationData = await models.packetLocation.findAll({ where: { location: 'branch out' } });
    } 

    return res.status(200).json({ message: 'success', data: locationData })

}
