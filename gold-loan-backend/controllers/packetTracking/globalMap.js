const models = require('../../models')
const { paginationWithFromTo } = require("../../utils/pagination");
const Sequelize = models.Sequelize;
const sequelize = models.sequelize;
const Op = Sequelize.Op;

exports.getGlobalMapDetails = async (req, res, next) => {

    let { date } = req.query
    console.log(date)


    let locationData = await models.packetTracking.findAll({
        where: { trackingDate: date, isActive: true },
        order: [
            [
                models.packetTrackingMasterloan,
                { model: models.customerLoanMaster, as: 'masterLoan' }, 'id', 'desc'],
            [
                models.packetTrackingMasterloan,
                { model: models.customerLoanMaster, as: 'masterLoan' },
                { model: models.customerLoanPacketData, as: 'locationData' },
                'id', 'desc'
            ]],
        include: [{
            model: models.user,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName']
        },
        {
            model: models.packetTrackingMasterloan,
            as: 'packetTrackingMasterloan',
            include: [{
                model: models.customerLoanMaster,
                as: 'masterLoan',
                attributes: ['id', 'isLoanCompleted'],
                include: [{
                    model: models.customerLoan,
                    as: 'customerLoan',
                    attributes: ['loanUniqueId', 'id']
                },
                {
                    model: models.customerLoanDisbursement,
                    as: 'customerLoanDisbursement',
                    // attributes:['cr']
                },
                {
                    model: models.customerLoanPacketData,
                    as: 'locationData',
                    // include: {
                    //     model: models.packetLocation,
                    //     as: 'packetLocation'
                    // }
                },
                {
                    model: models.packet,
                    as: 'packet',
                    attributes: ['packetUniqueId']
                }]
            }]
        }]
    })
    newLocationData = []
    for (let index = 0; index < locationData.length; index++) {
        const packetTrackingMasterloan = locationData[index].packetTrackingMasterloan;
        for (let j = 0; j < packetTrackingMasterloan.length; j++) {
            const element = packetTrackingMasterloan[j];
            if (element.masterLoan.locationData.length > 0 && element.masterLoan.locationData[0].status == 'in transit') {
                newLocationData.push(locationData[index])
            }
        }
    }

    res.status(200).json({ data: newLocationData })
}

exports.getPacketTrackingByLoanId = async (req, res, next) => {
    let { date, masterLoanId } = req.query;

    let packetTrackingData = await models.packetTracking.findAll({
        where: {
            trackingDate: date,
            masterLoanId: masterLoanId
        }
    })

    return res.status(200).json({ data: packetTrackingData })
}

exports.getGloablMapLocation = async (req, res, next) => {

    let { date } = req.query
    console.log(date)
    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );
    let locationData = await models.packetTracking.findAll({
        where: { trackingDate: date },
        include: [{
            model: models.user,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName']
        }, {
            model: models.packetTrackingMasterloan,
            as: 'packetTrackingMasterloan',
            include: [{
                model: models.customerLoanMaster,
                as: 'masterLoan',
                attributes: ['id'],
                include: [{
                    model: models.customerLoan,
                    as: 'customerLoan',
                    attributes: ['loanUniqueId', 'id']
                },
                {
                    model: models.packet,
                    as: 'packet',
                    attributes: ['packetUniqueId']
                }]
            }]
        }

        ],
        offset: offset,
        limit: pageSize,
    })

    let count = await models.packetTracking.findAll({
        where: { trackingDate: date },
    })


    if (count.length == 0) {
        res.status(200).json([])
    } else {

        res.status(200).json({ data: locationData, count: count.length })
    }
}