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

        }, {
            model: models.internalBranch,
            where: { id: 1 },
            attributes: []
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

    // let apprasiserData = await getAppraiser(date)
    // // let internalBranchId = req.userData.id
    // let temp = apprasiserData.map(ele=>ele.dataValues)
    // let newArray = []
    // for (let index = 0; index < temp.length; index++) {
    //     const element = temp[index];
    //     if(element.appraiserRequest.length != 0 ){
    //         for (let appraiserRequestIndex = 0; appraiserRequestIndex < element.appraiserRequest.length; appraiserRequestIndex++) {
    //             const appraiserRequest = element.appraiserRequest[appraiserRequestIndex];
    //             if(appraiserRequest.masterLoan){
    //                 element.masterLoan = appraiserRequest.masterLoan
    //                 newArray.push(element)
    //             }
    //         }
    //     }
    // }

    // for (let index = 0; index < newArray.length; index++) {
    //     delete newArray[index].appraiserRequest
    // }

    res.status(200).json({ data: locationData })
}

async function getAppraiser(date) {
    let getAppraiserList = await models.user.findAll({
        where: { isActive: true },
        attributes: ['id', 'firstName', 'lastName'],
        include: [{
            model: models.userType,
            as: 'Usertype',
            where: { isInternal: true, userType: 'Appraiser' },
            attributes: [],

        }, {
            model: models.internalBranch,
            where: { id: 1 },
            attributes: []
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
                }, {
                    model: models.packetTracking,
                    as: 'packetTracking',
                    where: { trackingDate: date }
                },]
            }]
        },]
    })

    return getAppraiserList
}