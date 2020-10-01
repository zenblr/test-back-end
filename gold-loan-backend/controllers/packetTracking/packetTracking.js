const models = require('../../models');
const Sequelize = models.Sequelize;
const sequelize = models.sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION
const _ = require('lodash');
const check = require("../../lib/checkLib"); // IMPORTING CHECKLIB 
const moment = require('moment')
const { paginationWithFromTo } = require("../../utils/pagination");
const CONSTANT = require('../../utils/constant');
const { createReferenceCode } = require("../../utils/referenceCode");
const request = require("request");



//FUNCTION TO GET ALL PACKET DETAILS
exports.getAllPacketTrackingDetail = async (req, res, next) => {
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let query = {};
    let associateModel = [
        {
            model: models.customerLoanDisbursement,
            as: 'customerLoanDisbursement',
            attributes: ['id', 'createdAt']
        },
        {
            model: models.customerLoan,
            as: 'customerLoan',
            attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
        },
        {
            model: models.customerLoanPackageDetails,
            as: 'loanPacketDetails',
            subQuery: false,
            attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
            include: [{
                model: models.packet,
                subQuery: false,
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
            attributes: ['id', 'customerUniqueId', 'firstName', 'lastName'],
        },
        {
            model: models.customerLoanPacketData,
            as: 'locationData',
            subQuery: false,
            include: [
                {
                    model: models.packetLocation,
                    as: 'packetLocation',
                    attributes: ['id', 'location']
                }
            ]
        },
        {
            model: models.customerPacketTracking,
            as: 'customerPacketTracking',
            where: { isDelivered: true },
            include: [
                {
                    model: models.customer,
                    as: 'customer',
                    attributes: ['id', 'firstName', 'lastName', 'mobileNumber']
                },
                {
                    model: models.user,
                    as: 'receiverUser',
                    attributes: ['id', 'firstName', 'lastName', 'mobileNumber']
                },
                {
                    model: models.partnerBranchUser,
                    as: 'receiverPartner',
                    attributes: ['id', 'firstName', 'lastName', 'mobileNumber']
                }
            ]
        }
    ]
    let stage = await models.loanStage.findAll({ where: { name: { [Op.in]: ['submit packet', 'packet branch out', 'packet in branch', 'packet submitted'] } } })
    let stageId = stage.map(ele => ele.id)

    let searchQuery = {
        [Op.and]: [query, {
            // [Op.or]: {
            // "$customerLoan.loan_unique_id$": { [Op.iLike]: search + '%' },
            //     "$loanPacketDetails.packets.internalBranch.name$": { [Op.iLike]: search + '%' },
            //     "$customer.first_name$": { [Op.iLike]: search + '%' },
            //     "$customer.last_name$": { [Op.iLike]: search + '%' },
            //     "$customer.customer_unique_id$": { [Op.iLike]: search + '%' },
            // },
        }],
        isActive: true,
        loanStageId: stageId
    };
    let packetDetails = await models.customerLoanMaster.findAll({
        // subQuery: false,
        where: searchQuery,
        include: associateModel,
        order: [
            ['id', 'DESC'],
            [models.customerLoan, 'id', 'asc'],
            [{ model: models.customerLoanPacketData, as: 'locationData' }, 'id', 'asc'],
            [{ model: models.customerPacketTracking, as: 'customerPacketTracking' }, 'id', 'desc']
        ],
        offset: offset,
        limit: pageSize,
    });

    let count = await models.customerLoanMaster.findAll({
        include: associateModel,
        where: searchQuery,
        // subQuery: false,
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
        where: { id: packetId, barcodeNumber: Barcode }
    })
    if (isMatched) {
        return res.status(200).json({ message: 'Barcode Matched' })
    } else {
        return res.status(400).json({ message: 'Barcode doesn\'t Matched!' })
    }
}

//FUNCTION TO GET USER NAME
exports.getUserName = async (req, res) => {
    let { mobileNumber, receiverType, masterLoanId, partnerBranchId, allUsers, internalBranchId } = req.query

    let masterLoan = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })
    if (receiverType == 'InternalUser') {

        let whereCondition = { mobileNumber: mobileNumber }

        if (!Number(allUsers)) {
            let userType = await models.userType.findAll({ where: { userType: { [Op.in]: ['Branch Manager', 'Appraiser'] } } })
            let userTypeIdArray = await userType.map((data) => data.id);
            whereCondition.userTypeId = { [Op.in]: userTypeIdArray }
        }

        let User = await models.user.findOne({
            where: whereCondition,
            attributes: ['id', 'firstName', 'lastName'],
            include: [
                {
                    model: models.internalBranch,
                    where: { id: masterLoan.internalBranchId },
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


    } else if (receiverType == 'Customer') {
        let User = await models.customer.findOne({
            where: { mobileNumber: mobileNumber },
            attributes: ['id', 'firstName', 'lastName']
        });
        if (User) {
            return res.status(200).json({ data: User, receiverType });
        } else {
            return res.status(404).json({ message: 'Customer not found!' });
        }
    } else if (receiverType == 'PartnerUser') {
        let User = await models.partnerBranchUser.findOne({
            where: { mobileNumber: mobileNumber, branchId: Number(partnerBranchId) },
            attributes: ['id', 'firstName', 'lastName']
        });
        if (User) {
            return res.status(200).json({ data: User, receiverType });
        } else {
            return res.status(404).json({ message: 'Partner user not found!' });
        }
    }

}

//FUNCTION TO GET LOGS OF PACKET TRACKING
exports.viewCustomerPacketTrackingLogs = async (req, res) => {
    let { masterLoanId, loanId } = req.query

    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let searchQuery = {
        masterLoanId: masterLoanId,
        isDelivered: true
    }

    let includeArray = [
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
        },
        {
            model: models.internalBranch,
            as: 'internalBranch'
        },

        {
            model: models.partnerBranch,
            as: 'partnerBranch',
            include: [
                {
                    model: models.partner,
                    as: 'partner'
                }
            ]
        }
    ]

    let logDetails = await models.customerPacketTracking.findAll({
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
            } else if (log.senderPartner != null) {
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
            } else if (log.receiverPartner != null) {
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


    let count = await models.customerPacketTracking.findAll({
        where: searchQuery,
        order: [
            ['id', 'DESC']
        ],
        include: includeArray

    });

    let lastLocation = await models.packetTracking.findOne({
        where: { isActive: true },
        attributes: ['address'],
        include: [{
            model: models.packetTrackingMasterloan,
            as: 'packetTrackingMasterloan',
            where: { masterLoanId },
            attributes: ['id', 'masterLoanId']
        }]
    })

    if (logDetail.length != 0) {
        return res.status(200).json({ data: logDetail, count: count.length, lastLocation });
    }
    else {
        return res.status(404).json({ message: 'Data not found!' });
    }

}

exports.addPacketLocation = async (req, res) => {

    let { latitude, longitude, appraiserId, packetId, masterLoanId, customerLoanId, packetLocationId } = req.body

    await models.packetTracking.update(
        { isActive: false },
        { where: { masterLoanId: masterLoanId } })

    let packetlocation = await models.packetTracking.create({ latitude, longitude, appraiserId, packetId, masterLoanId, customerLoanId, packetLocationId })

    if (packetlocation) {
        return res.status(200).json({ message: success })
    }
}

exports.addPacketTracking = async (req, res, next) => {

    let getAll = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let userId = req.userData.id;


    // let stageId = await models.loanStage.findOne({ where: { name: 'disbursed' } })
    // let master = await models.customerLoanMaster.findAll({
    //     where: {
    //         isActive: true,
    //         loanStageId: stageId.id
    //     }
    // })

    // if (master.length === 0) {
    //     return res.status(200).json({ message: "Loan is not yet disbursed" })
    // }

    var trackingTime = getAll['trackingDate']
    var date = moment(trackingTime);
    var timeComponent = date.utc(true).format('HH:mm');


    getAll['createdBy'] = createdBy
    getAll['modifiedBy'] = modifiedBy
    getAll['userId'] = userId
    getAll['trackingTime'] = timeComponent;
    getAll['isActive'] = true
    getAll['totalDistance'] = 0

    let packet = await sequelize.transaction(async t => {
        let masterLoanArray = []
        let deActivate = await models.packetTracking.update({ isActive: false },
            {
                where: {
                    userId: userId,
                    trackingDate: moment().format('YYYY-MM-DD')
                }, transaction: t,
            })

        let lastLocation = await models.packetTracking.findOne({
            where: {
                userId: userId,
                trackingDate: moment().format('YYYY-MM-DD')
            }, transaction: t,
            order: [['createdAt', 'desc']]
        })
        if (lastLocation) {
            let dist = await calculateDistance(lastLocation.latitude, lastLocation.longitude, getAll.latitude, getAll.longitude, "K")
            getAll.distance = Number(dist)
            getAll.totalDistance = Number(lastLocation.totalDistance) + Number(dist)

        }

        let packetTracking = await models.packetTracking.create(getAll, { transaction: t })



        for (let index = 0; index < getAll['masterLoanArray'].length; index++) {
            const element = getAll['masterLoanArray'][index];
            let masterLoanObject = {}
            masterLoanObject.packetTrackingId = packetTracking.id
            masterLoanObject.masterLoanId = element

            masterLoanArray.push(masterLoanObject)
        }

        let data = await models.packetTrackingMasterloan.bulkCreate(masterLoanArray, { transaction: t })
    })





    return res.status(200).json({ message: "Success" })
}

async function calculateDistance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var radlon1 = Math.PI * lon1 / 180
    var radlon2 = Math.PI * lon2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist.toFixed(2);
}

exports.getMapDetails = async (req, res, next) => {

    let { masterLoanId, date } = req.query

    let data = await models.packetTracking.findAll({
        where: {
            trackingDate: date,

        },
        include: [{
            model: models.packetTrackingMasterloan,
            as: 'packetTrackingMasterloan',
            where: { masterLoanId: masterLoanId },
            include: [{
                model: models.customerLoanMaster,
                as: 'masterLoan',
                attributes: ['id'],
                include: {
                    model: models.packet,
                    as: 'packet',
                    attributes: ['packetUniqueId']
                }
            }]

        }]
    })

    res.status(200).json({ data: data })

}

exports.getLocationDetails = async (req, res, next) => {

    let { masterLoanId, date } = req.query

    const { offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );

    let data = await models.packetTracking.findAll({
        where: {
            trackingDate: date
        },
        include: [{
            model: models.packetTrackingMasterloan,
            as: 'packetTrackingMasterloan',
            where: { masterLoanId: masterLoanId },
        }],
        order: [['trackingTime', 'DESC']],
        offset: offset,
        limit: pageSize,

    })

    let count = await models.packetTracking.findAll({
        where: {
            trackingDate: date
        },
        include: [{
            model: models.packetTrackingMasterloan,
            as: 'packetTrackingMasterloan',
            where: { masterLoanId: masterLoanId },
        }]
    })

    if (data.length > 0) {

        res.status(200).json({ data: data, count: count.length })
    } else {
        res.status(200).json([])

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

    let { referenceCode, otp, masterLoanId, loanId } = req.body
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

    let loanStage = await models.loanStage.findOne({ where: { name: 'submit packet' } })

    let packetLocation
    if (req.useragent.isMobile) {
        packetLocation = await models.packetLocation.findOne({ where: { location: 'customer home out' } });
    } else {
        packetLocation = await models.packetLocation.findOne({ where: { location: 'customer check out' } });
    }

    await sequelize.transaction(async (t) => {

        await models.customerLoanMaster.update({ loanStageId: loanStage.id }, { where: { id: masterLoanId }, transaction: t })

        await models.customerLoanPacketData.create({ masterLoanId: masterLoanId, packetLocationId: packetLocation.id, status: 'in transit' }, { transaction: t });

        let packetTrackingData = await models.customerPacketTracking.create({ masterLoanId, loanId, internalBranchId: internalBranchId, packetLocationId: packetLocation.id, userSenderId: id, userReceiverId: id, isDelivered: true, status: 'in transit' }, { transaction: t });

        let allPacketTrackingData = await models.customerPacketTracking.findAll({
            where: { masterLoanId: masterLoanId, isDelivered: true },
            transaction: t,
            order: [['id', 'desc']]
        })

        var processingTime = moment.utc(moment(packetTrackingData.updatedAt, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(allPacketTrackingData[allPacketTrackingData.length - 1].updatedAt, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")

        await models.customerPacketTracking.update({ processingTime: processingTime }, { where: { id: packetTrackingData.id }, transaction: t });

    })

    return res.status(200).json({ message: 'success' })

}

exports.getParticularLocation = async (req, res, next) => {

    let { packetLocationId, masterLoanId } = req.query

    let { location } = await models.packetLocation.findOne({ where: { id: packetLocationId } })
    let masterLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        include: [{
            model: models.customerLoan,
            as: 'customerLoan',
            Where: { loanType: 'secured' }
        }]
    })
    if (location == "branch in") {
        let internalBranchDataSingle = await models.internalBranch.findOne({ where: { id: masterLoan.internalBranchId } })

        let internalBranchData = await models.internalBranch.findAll({
            where: { cityId: internalBranchDataSingle.cityId, isActive: true },
        })
        return res.status(200).json({ data: internalBranchData, loanBranchId: masterLoan.internalBranchId })
    } else if (location == "partner branch in") {

        let partnerBranchData = await models.partner.findOne({
            where: { id: masterLoan.customerLoan[0].partnerId },
            include: [{
                model: models.partnerBranch,
                as: 'partnerBranch',
                isActive: true
            }]
        })
        return res.status(200).json({ data: partnerBranchData, loanBranchId: null })
    }
}

exports.submitLoanPacketLocation = async (req, res, next) => {

    let { internalBranchId, partnerBranchId, customerReceiverId, userReceiverId, partnerReceiverId, receiverType, packetLocationId, loanId, masterLoanId } = req.body

    if (req.userData.userBelongsTo === "InternalUser") {
        userSenderId = req.userData.id
        senderType = req.userData.userBelongsTo
        partnerSenderId = null
    } else if (req.userData.userBelongsTo === "PartnerUser") {
        partnerSenderId = req.userData.id
        senderType = req.userData.userBelongsTo
        userSenderId = null
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

    let { location } = await models.packetLocation.findOne({ where: { id: packetLocationId } });
    if (location == "branch in") {
        let loanStage = await models.loanStage.findOne({ where: { name: 'packet in branch' } })

        await sequelize.transaction(async (t) => {

            let masterLoan = await models.customerLoanMaster.findOne({
                where: { id: masterLoanId },
                attributes: ['id'],
                include: [
                    {
                        model: models.customerLoan,
                        as: 'customerLoan',
                        attributes: ['id', 'partnerId'],
                        include: [
                            {
                                model: models.partner,
                                as: 'partner',
                                attributes: ['id', 'submitPacketInInternalBranch']
                            }
                        ]
                    }
                ]
            })

            let branchCheck = masterLoan.customerLoan[0].partner.submitPacketInInternalBranch
            let packetTrackingData;
            if (branchCheck) {

                let loanStageForBranch = await models.loanStage.findOne({ where: { name: 'packet submitted' } })
                await models.customerLoanMaster.update({ loanStageId: loanStageForBranch.id, isLoanCompleted: true }, { where: { id: masterLoanId }, transaction: t })

                await models.customerLoanPacketData.create({ masterLoanId: masterLoanId, packetLocationId: packetLocationId, status: 'complete' }, { transaction: t })

                packetTrackingData = await models.customerPacketTracking.create({
                    internalBranchId, customerReceiverId, userReceiverId, partnerReceiverId, receiverType, loanId, masterLoanId, packetLocationId, userSenderId, partnerSenderId, senderType, isDelivered: true, status: 'complete'
                }, { transaction: t });

            } else {

                await models.customerLoanMaster.update({ loanStageId: loanStage.id }, { where: { id: masterLoanId }, transaction: t })

                await models.customerLoanPacketData.create({ masterLoanId: masterLoanId, packetLocationId: packetLocationId, status: 'incomplete' }, { transaction: t })

                packetTrackingData = await models.customerPacketTracking.create({
                    internalBranchId, customerReceiverId, userReceiverId, partnerReceiverId, receiverType, loanId, masterLoanId, packetLocationId, userSenderId, partnerSenderId, senderType, isDelivered: true, status: 'incomplete'
                }, { transaction: t });

            }

            let allPacketTrackingData = await models.customerPacketTracking.findAll({
                where: { masterLoanId: masterLoanId, isDelivered: true },
                transaction: t,
                order: [['id', 'desc']]
            })

            var processingTime = moment.utc(moment(packetTrackingData.updatedAt, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(allPacketTrackingData[allPacketTrackingData.length - 1].updatedAt, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")

            await models.customerPacketTracking.update({ processingTime: processingTime }, { where: { id: packetTrackingData.id }, transaction: t });


        })

    } else if (location == "partner branch in") {

        let loanStage = await models.loanStage.findOne({ where: { name: 'packet submitted' } })

        await sequelize.transaction(async (t) => {


            await models.customerLoanMaster.update({ loanStageId: loanStage.id, isLoanCompleted: true }, { where: { id: masterLoanId }, transaction: t })

            await models.customerLoanPacketData.create({ masterLoanId: masterLoanId, packetLocationId: packetLocationId, status: 'complete' }, { transaction: t })


            let packetTrackingData = await models.customerPacketTracking.create({
                partnerBranchId, customerReceiverId, userReceiverId, partnerReceiverId, receiverType, loanId, masterLoanId, packetLocationId, userSenderId, partnerSenderId, senderType, isDelivered: true, status: 'complete'
            });

            let allPacketTrackingData = await models.customerPacketTracking.findAll({
                where: { masterLoanId: masterLoanId, isDelivered: true },
                transaction: t,
                order: [['id', 'desc']]
            })

            var processingTime = moment.utc(moment(packetTrackingData.updatedAt, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(allPacketTrackingData[allPacketTrackingData.length - 1].updatedAt, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")

            await models.customerPacketTracking.update({ processingTime: processingTime }, { where: { id: packetTrackingData.id }, transaction: t });
        })
    }

    return res.status(200).json({ message: `packet location submitted` })

}

exports.getDeliveryLocation = async (req, res, next) => {
    let { packetLocationId, masterLoanId } = req.query

    let { location } = await models.packetLocation.findOne({ where: { id: packetLocationId } })
    let masterLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        include: [{
            model: models.customerLoan,
            as: 'customerLoan',
            Where: { loanType: 'secured' }
        }]
    })
    let searchQuery
    if (location == 'branch out') {
        searchQuery = { id: { [Op.in]: ['branch in', 'partner branch in', 'customer home in'] } }
    } else if (location == 'partner branch out') {
        searchQuery = { id: { [Op.in]: ['branch in', 'partner branch in', 'customer home in'] } }
    }

    let deliveryLocationData = await models.packetLocation.findAll({
        where: searchQuery
    })

    return res.status(200).json({ data: deliveryLocationData })

}

//FUNCTION TO UPDATE  LOCATION IN PACKET TRACKING 
exports.addCustomerPacketTracking = async (req, res, next) => {
    //console.log(req.userData.userBelongsTo)

    let senderInternalBranch = req.userData.internalBranchId
    if (req.userData.userBelongsTo === "InternalUser") {
        userSenderId = req.userData.id
        senderType = req.userData.userBelongsTo
        partnerSenderId = null
    } else if (req.userData.userBelongsTo === "PartnerUser") {
        partnerSenderId = req.userData.id
        senderType = req.userData.userBelongsTo
        userSenderId = null
    }
    let { deliveryPacketLocationId, deliveryInternalBranchId, deliveryPartnerBranchId, partnerBranchId, customerReceiverId, userReceiverId, partnerReceiverId, receiverType, packetLocationId, loanId, masterLoanId } = req.body;

    let { location } = await models.packetLocation.findOne({ where: { id: deliveryPacketLocationId } });

    let masterLoan = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })

    let deliveryReceiverType;
    if (location == "partner branch in") {
        deliveryReceiverType = 'PartnerUser'
    } else if (location == 'branch in') {
        deliveryReceiverType = 'InternalUser'
    } else if (location == 'customer home in') {
        deliveryReceiverType = 'Customer'
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

        let partnerBranchInLocation = await models.packetLocation.findOne({ where: { location: 'partner branch in' }, transaction: t })
        let branchOutLocation = await models.packetLocation.findOne({ where: { location: 'branch out' }, transaction: t })
        let packetInBranch = await models.loanStage.findOne({ where: { name: 'packet in branch' }, transaction: t })
        let packetSubmitted = await models.loanStage.findOne({ where: { name: 'packet submitted' }, transaction: t })
        let packetBranchOut = await models.loanStage.findOne({ where: { name: 'packet branch out' }, transaction: t })

        if (masterLoan.loanStageId == packetInBranch.id) {
            if (packetLocationId == partnerBranchInLocation.id) {
                await models.customerLoanMaster.update({ loanStageId: packetSubmitted.id, isLoanCompleted: true }, { where: { id: masterLoanId }, transaction: t })
            }
            if (packetLocationId == branchOutLocation.id) {
                await models.customerLoanMaster.update({ loanStageId: packetBranchOut.id }, { where: { id: masterLoanId }, transaction: t })
            }
        }

        await models.customerLoanPacketData.create({ masterLoanId: masterLoanId, packetLocationId: packetLocationId, status: 'in transit' }, { transaction: t })

        let packetTrackingData = await models.customerPacketTracking.create({
            customerReceiverId, internalBranchId: senderInternalBranch, partnerBranchId, userReceiverId, partnerReceiverId, receiverType, loanId, masterLoanId, packetLocationId, userSenderId, partnerSenderId, senderType, isDelivered: true, status: 'in transit'
        }, { transaction: t });

        let allPacketTrackingData = await models.customerPacketTracking.findAll({
            where: { masterLoanId: masterLoanId, isDelivered: true },
            transaction: t,
            order: [['id', 'desc']]
        })

        var processingTime = moment.utc(moment(packetTrackingData.updatedAt, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(allPacketTrackingData[allPacketTrackingData.length - 1].updatedAt, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")

        await models.customerPacketTracking.update({ processingTime: processingTime }, { where: { id: packetTrackingData.id }, transaction: t });


        await models.customerPacketTracking.create({
            packetLocationId: deliveryPacketLocationId, internalBranchId: deliveryInternalBranchId, partnerBranchId: deliveryPartnerBranchId, senderType: receiverType, loanId, masterLoanId, userSenderId: userReceiverId, partnerSenderId: partnerReceiverId, receiverType: deliveryReceiverType
        }, { transaction: t })
    })

    return res.status(200).json({ message: 'Location Added' });

}

exports.myDeliveryPacket = async (req, res, next) => {
    let id = req.userData.id

    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let searchQuery = {
        isDelivered: false,
        userSenderId: id
    }

    let includeArray = [
        {
            model: models.customerLoanMaster,
            as: 'masterLoan',
            attributes: ['id'],
            include: [
                {
                    model: models.internalBranch,
                    as: 'internalBranch',
                    attributes: ['id', 'name']
                },
                {
                    model: models.customerLoan,
                    as: 'customerLoan'
                },
                {
                    model: models.customer,
                    as: 'customer',
                    attributes: ['id', 'customerUniqueId', 'firstName', 'lastName'],
                },
                {
                    model: models.customerLoanPacketData,
                    as: 'locationData',
                    include: [
                        {
                            model: models.packetLocation,
                            as: 'packetLocation',
                            attributes: ['id', 'location']
                        }
                    ]
                },
                {
                    model: models.packet,
                    as: 'packet',
                    attributes: ['packetUniqueId']
                }
            ]
        },
        {
            model: models.partnerBranch,
            as: 'partnerBranch',
            attributes: ['id', 'name', 'branchId'],
            include: [
                {
                    model: models.partner,
                    as: 'partner',
                    attributes: ['id', 'name', 'partnerId'],
                }
            ]
        }
    ]

    let logDetails = await models.customerPacketTracking.findAll({
        where: searchQuery,
        order: [
            ['id', 'DESC'],
            [{ model: models.customerLoanMaster, as: 'masterLoan' }, { model: models.customerLoanPacketData, as: 'locationData' }, 'id', 'asc']
        ],
        include: includeArray,
        offset: offset,
        limit: pageSize,
    });

    let count = await models.customerPacketTracking.findAll({
        where: searchQuery,
        order: [
            ['id', 'DESC']
        ],
        include: includeArray

    });

    return res.status(200).json({ data: logDetails, count: count.length })

}

exports.deliveryUserType = async (req, res, next) => {

    let { id } = req.query

    let data = await models.customerPacketTracking.findOne({ where: { id: id } })

    return res.status(200).json({ data })
}

exports.deliveryApproval = async (req, res, next) => {
    let { referenceCode, otp, id, partnerReceiverId, userReceiverId, customerReceiverId } = req.body

    let { receiverType, packetLocationId, masterLoanId, updatedAt, createdAt } = await models.customerPacketTracking.findOne({ where: { id: id } })

    let masterLoan = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })

    let verifyUser
    var todayDateTime = new Date();
    switch (receiverType) {
        case "Customer":
            verifyUser = await models.customerOtp.findOne({
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
            break;
        case "InternalUser":
            verifyUser = await models.userOtp.findOne({
                where: {
                    referenceCode, otp,
                    expiryTime: {
                        [Op.gte]: todayDateTime
                    }
                }
            })
            if (check.isEmpty(verifyUser)) {
                return res.status(400).json({ message: `INVALID OTP.` })
            }
            break;
        case "PartnerUser":
            verifyUser = await models.partnerBranchOtp.findOne({
                where: {
                    referenceCode, otp,
                    expiryTime: {
                        [Op.gte]: todayDateTime
                    }
                }
            })
            if (check.isEmpty(verifyUser)) {
                return res.status(400).json({ message: `INVALID OTP.` })
            }
            break;
    }

    await sequelize.transaction(async (t) => {

        let partnerBranchInLocation = await models.packetLocation.findOne({ where: { location: 'partner branch in' }, transaction: t })
        let branchOutLocation = await models.packetLocation.findOne({ where: { location: 'branch out' }, transaction: t })
        let packetInBranch = await models.loanStage.findOne({ where: { name: 'packet in branch' }, transaction: t })
        let packetSubmitted = await models.loanStage.findOne({ where: { name: 'packet submitted' }, transaction: t })
        let packetBranchOut = await models.loanStage.findOne({ where: { name: 'packet branch out' }, transaction: t })

        if (masterLoan.loanStageId == packetBranchOut.id) {
            if (packetLocationId == partnerBranchInLocation.id) {
                await models.customerLoanMaster.update({ loanStageId: packetSubmitted.id, isLoanCompleted: true }, { where: { id: masterLoanId }, transaction: t })
            }
            if (packetLocationId == branchOutLocation.id) {
                await models.customerLoanMaster.update({ loanStageId: packetBranchOut.id }, { where: { id: masterLoanId }, transaction: t })
            }
        }

        let allPacketTrackingData = await models.customerPacketTracking.findAll({
            where: { masterLoanId: masterLoanId, isDelivered: true },
            transaction: t,
            order: [['id', 'desc']]
        })

        await models.customerLoanPacketData.create({ masterLoanId: masterLoanId, packetLocationId: packetLocationId, status: 'complete' }, { transaction: t })

        await models.customerPacketTracking.update({ isDelivered: true, partnerReceiverId, userReceiverId, customerReceiverId, processingTime: processingTime, status: 'complete' }, { where: { id: id }, transaction: t })

        let letestPreTime = await models.customerPacketTracking.findOne({ where: { id: id }, transaction: t })

        var processingTime = moment.utc(moment(letestPreTime.updatedAt, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(allPacketTrackingData[0].updatedAt, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")
        await models.customerPacketTracking.update({ processingTime: processingTime }, { where: { id: id }, transaction: t })
    })

    return res.status(200).json({ message: 'success' })

}

exports.getNextPacketLoaction = async (req, res, next) => {
    let { masterLoanId } = req.query

    let packetTrackingData = await models.customerPacketTracking.findAll({
        where: { masterLoanId: masterLoanId, isDelivered: true },
        order: [['id', 'desc']]
    })

    let locationId = packetTrackingData[0].packetLocationId

    let { location } = await models.packetLocation.findOne({ where: { id: locationId } });

    let locationData;

    if (location == 'branch in') {
        locationData = await models.packetLocation.findAll({ where: { location: 'branch out' } });
    } else if (location == 'partner branch in') {
        locationData = await models.packetLocation.findAll({ where: { location: 'partner branch out' } });
    }

    return res.status(200).json({ message: 'success', data: locationData })

}

exports.submitLoanPacketLocationForCollect = async (req, res, next) => {

    let { internalBranchId, partnerBranchId, customerReceiverId, userReceiverId, partnerReceiverId, receiverType, packetLocationId, loanId, masterLoanId, isFullRelease, releaseId } = req.body

    if (req.userData.userBelongsTo === "InternalUser") {
        userSenderId = req.userData.id
        senderType = req.userData.userBelongsTo
        partnerSenderId = null
    } else if (req.userData.userBelongsTo === "PartnerUser") {
        partnerSenderId = req.userData.id
        senderType = req.userData.userBelongsTo
        userSenderId = null
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

    let { location } = await models.packetLocation.findOne({ where: { id: packetLocationId } });

    // let loanStage = await models.loanStage.findOne({ where: { name: 'packet release from' } });

    if (location == 'partner branch out') {
        await sequelize.transaction(async (t) => {

            // await models.customerLoanMaster.update({ loanStageId: loanStage.id }, { where: { id: masterLoanId }, transaction: t })

            await models.customerLoanPacketData.create({ masterLoanId: masterLoanId, packetLocationId: packetLocationId, status: 'in transit' }, { transaction: t })

            let packetTrackingData = await models.customerPacketTracking.create({
                internalBranchId: req.userData.internalBranchId,
                userReceiverId: req.userData.id,
                receiverType: 'InternalUser',
                loanId,
                masterLoanId,
                packetLocationId: packetLocationId,
                partnerSenderId: partnerReceiverId,
                senderType: 'PartnerUser',
                isDelivered: true,
                status: 'in transit'
            }, { transaction: t });

            let allPacketTrackingData = await models.customerPacketTracking.findAll({
                where: { masterLoanId: masterLoanId, isDelivered: true },
                transaction: t,
                order: [['id', 'desc']]
            })

            var processingTime = moment.utc(moment(packetTrackingData.updatedAt, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(allPacketTrackingData[allPacketTrackingData.length - 1].updatedAt, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")

            await models.customerPacketTracking.update({ processingTime: processingTime }, { where: { id: packetTrackingData.id }, transaction: t });
        })

        return res.status(200).json({ message: `packet location submitted` })

    } else {
        return res.satus(200).json({ message: 'please select partner branch out location for this process' })
    }

}

exports.submitLoanPacketLocationForHomeIn = async (req, res, next) => {

    let { internalBranchId, partnerBranchId, customerReceiverId, userReceiverId, partnerReceiverId, receiverType, packetLocationId, loanId, masterLoanId, isFullRelease, releaseId } = req.body

    let modifiedBy = req.userData.id
    let userSenderId;
    let partnerSenderId;
    let senderType;
    if (req.userData.userBelongsTo === "InternalUser") {
        userSenderId = req.userData.id
        senderType = req.userData.userBelongsTo
        partnerSenderId = null
    } else if (req.userData.userBelongsTo === "PartnerUser") {
        partnerSenderId = req.userData.id
        senderType = req.userData.userBelongsTo
        userSenderId = null
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

    let { location } = await models.packetLocation.findOne({ where: { id: packetLocationId } });
    if (location == "customer home in") {
        // let loanStage = await models.loanStage.findOne({ where: { name: 'packet in branch' } })

        await sequelize.transaction(async (t) => {

            // await models.customerLoanMaster.update({ loanStageId: loanStage.id }, { where: { id: masterLoanId }, transaction: t })

            await models.customerLoanPacketData.create({ masterLoanId: masterLoanId, packetLocationId: packetLocationId, status: 'complete' }, { transaction: t })

            let packetTrackingData = await models.customerPacketTracking.create({
                internalBranchId, customerReceiverId, userReceiverId, partnerReceiverId, receiverType, loanId, masterLoanId, packetLocationId, userSenderId, partnerSenderId, senderType, isDelivered: true, status: 'complete'
            }, { transaction: t });

            let allPacketTrackingData = await models.customerPacketTracking.findAll({
                where: { masterLoanId: masterLoanId, isDelivered: true },
                transaction: t,
                order: [['id', 'desc']]
            })

            var processingTime = moment.utc(moment(packetTrackingData.updatedAt, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(allPacketTrackingData[allPacketTrackingData.length - 1].updatedAt, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")

            await models.customerPacketTracking.update({ processingTime: processingTime }, { where: { id: packetTrackingData.id }, transaction: t });

            let releaseDate = moment();

            if (isFullRelease) {
                await models.fullRelease.update({ fullReleaseStatus: 'released', modifiedBy, releaseDate, isCustomerReceivedPacket: true }, { where: { id: releaseId }, transaction: t })

                await models.customerLoanMaster.update({ isOrnamentsReleased: true, modifiedBy }, { where: { id: masterLoanId }, transaction: t });

            } else {
                await models.partRelease.update({ partReleaseStatus: 'released', modifiedBy, releaseDate, isCustomerReceivedPacket: true }, { where: { id: releaseId }, transaction: t })
                await models.customerLoanMaster.update({ isOrnamentsReleased: true, isFullOrnamentsReleased: true, modifiedBy }, { where: { id: masterLoanId }, transaction: t });
            }

        })
        return res.status(200).json({ message: `packet location submitted` })

    } else {
        return res.satus(200).json({ message: 'please select customer home in location for this process' })
    }

}

exports.getCustomerInfo = async (req, res, next) => {
    let { masterLoanId } = req.query

    let masterLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId }
    })

    let customerInfo = await models.customer.findOne({
        where: { id: masterLoan.customerId },
        attributes: ['id', 'firstName', 'lastName', 'mobileNumber']
    })

    customerInfo.dataValues.receiverType = "Customer"

    return res.status(200).json({ data: customerInfo })
}
