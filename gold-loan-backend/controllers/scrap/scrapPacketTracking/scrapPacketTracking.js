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
    let { scrapId } = req.query;

    let data = await models.customerScrap.findOne({
        where: { id: scrapId },
        attributes: ['finalScrapAmountAfterMelting'],
        include: [{
            model: models.customerScrapPackageDetails,
            as: 'scrapPacketDetails',
            include: {
                model: models.scrapPacket,
                attributes: ['id', 'packetUniqueId', 'barcodeNumber', 'scrapId']
            }
        },
        {
            model: models.scrapMeltingOrnament,
            as: 'meltingOrnament',
        }]
    });

    return res.status(200).json({ data: data });
}

exports.getParticularLocation = async (req, res, next) => {

    let { packetLocationId, scrapId } = req.query

    let { location } = await models.scrapPacketLocation.findOne({ where: { id: packetLocationId } })
    let customerScrap = await models.customerScrap.findOne({
        where: { id: scrapId },

    })
    if (location == "branch in") {
        let internalBranchDataSingle = await models.internalBranch.findOne({ where: { id: customerScrap.internalBranchId } })

        let internalBranchData = await models.internalBranch.findAll({
            where: { cityId: internalBranchDataSingle.cityId, isActive: true },
        })
        return res.status(200).json({ data: internalBranchData, scrapBranchId: customerScrap.internalBranchId })
    }
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
                },
                {
                    model: models.role,
                    attributes: ['id', 'roleName']
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

exports.submitScrapPacketLocation = async (req, res, next) => {

    let { internalBranchId, userReceiverId, receiverType, packetLocationId, scrapId } = req.body

    if (req.userData.userBelongsTo === "InternalUser") {
        userSenderId = req.userData.id
        senderType = req.userData.userBelongsTo
    }

    let verifyUser
    var todayDateTime = new Date();

    let { location } = await models.scrapPacketLocation.findOne({ where: { id: packetLocationId } });
    if (location == "branch in") {
        let scrapStage = await models.scrapStage.findOne({ where: { stageName: 'packet in branch' } })

        await sequelize.transaction(async (t) => {

            await models.customerScrap.update({ scrapStageId: scrapStage.id }, { where: { id: scrapId }, transaction: t });

            await models.customerScrapPacketData.create({ scrapId: scrapId, packetLocationId: packetLocationId, status: "incomplete" }, { transaction: t });

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

        let senderInternalBranch = req.userData.internalBranchId
        if (req.userData.userBelongsTo === "InternalUser") {
            userSenderId = req.userData.id
            senderType = req.userData.userBelongsTo
        }
        let { receiverType, packetLocationId, scrapId, courier, podNumber } = req.body;


        let customerScrap = await models.customerScrap.findOne({ where: { id: scrapId } })

        let verifyUser
        var todayDateTime = new Date();

        await sequelize.transaction(async (t) => {

            let packetInBranch = await models.scrapStage.findOne({ where: { stageName: 'packet in branch' }, transaction: t })
            let packetSubmitted = await models.scrapStage.findOne({ where: { stageName: 'packet submitted' }, transaction: t })

            if (customerScrap.scrapStageId == packetInBranch.id) {
                await models.customerScrap.update({ scrapStageId: packetSubmitted.id, isScrapCompleted: true }, { where: { id: scrapId }, transaction: t })
            }

            await models.customerScrapPacketData.create({ scrapId: scrapId, packetLocationId: packetLocationId, status: "complete" }, { transaction: t })

            let packetTrackingData = await models.scrapCustomerPacketTracking.create({
                internalBranchId: senderInternalBranch, receiverType, scrapId, packetLocationId, userSenderId, senderType, isDelivered: true, courier, podNumber
            }, { transaction: t });

            let allPacketTrackingData = await models.scrapCustomerPacketTracking.findAll({
                where: { scrapId: scrapId, isDelivered: true },
                transaction: t,
                order: [['id', 'desc']]
                })
            console.log(allPacketTrackingData);
            
            var processingTime = moment.utc(moment(packetTrackingData.updatedAt, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(allPacketTrackingData[1].updatedAt, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")

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
            {
                model: models.scrapStage,
                as: 'scrapStage',
                attributes: ['id', 'stageName']
            },
            {
                model: models.customerScrapDisbursement,
                as: 'scrapDisbursement',
                attributes: ['createdAt']
            }
        ];

        if (req.query.status) {
            query["$locationData.status$"] = await req.query.status.split(',');
        }

        let stage = await models.scrapStage.findAll({ where: { stageName: { [Op.in]: ['submit packet', 'packet in branch', 'packet submitted'] } } })
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
        {
            model: models.user,
            as: 'receiverUser',
            attributes: ['id', 'firstName', 'lastName']
        },
        {
            model: models.internalBranch,
            as: 'internalBranch'
        }
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
            if (log.receiverUser != null) {
                receiverData.push({
                    id: log.id,
                    firstName: log.receiverUser.firstName,
                    lastName: log.receiverUser.lastName,
                    receiverType: log.receiverType,
                });
            }

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

    let { location } = await models.scrapPacketLocation.findOne({ where: { id: locationId } });

    let locationData;

    if (location == 'branch in') {
        locationData = await models.scrapPacketLocation.findAll({ where: { location: 'branch out' } });
    }

    return res.status(200).json({ message: 'success', data: locationData })

}
