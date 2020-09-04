const models = require('../../models')
const { paginationWithFromTo } = require("../../utils/pagination");


exports.getGlobalMapDetails = async (req, res, next) => {

    let { date } = req.query
    console.log(date)

    let getAppraiserList = await models.user.findAll({
        where: { isActive: true },
        attributes: ['id', 'firstName', 'lastName'],
        include: [{
            model: models.userType,
            as: 'Usertype',
            where: { isInternal: true, userType: 'Appraiser' },
            attributes: [],

        },
        {
            model: models.appraiserRequest,
            as: 'appraiserRequest',
            attributes: ['id'],
            include: [{
                model: models.customerLoanMaster,
                as: 'masterLoan',
                attributes: ['id'],
                include: [{
                    model: models.customerLoan,
                    as: 'customerLoan',
                    attributes: ['loanUniqueId'],
                }]
            }]
        },]
    })
    // let internalBranchId = req.userData.id

    res.status(200).json({ data: getAppraiserList })
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
            model: models.customerLoan,
            as: 'customerLoan',
            include: {
                model: models.packet,
                as: 'packet',
                where: { isActive: true }
            }
        },

        ],
        offset: offset,
        limit: pageSize,
    })

    let count = await models.packetTracking.findAll({
        where: { trackingDate: date },
    })

   
    if(count.length == 0){
        res.status(200).json([])
    }else{

        res.status(200).json({ data: locationData,count:count.length })
    }
}