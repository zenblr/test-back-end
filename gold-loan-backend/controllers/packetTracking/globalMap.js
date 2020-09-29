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
        order: [['createdAt']],
        include: [{
            model: models.user,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName']
        }, {
            model: models.customerLoan,
            as: 'customerLoan',
            attributes: ['loanUniqueId'],
            include: {
                model: models.packet,
                as: 'packet',
                where: { isActive: true }
            }
        }],
    })

   

    let group = locationData.reduce((r, a) => {
        console.log("a", a);
        console.log('r', r);
        r[a.userId] = [...r[a.userId] || [], a];
        return r;
    }, {});

    let data = []
    Object.keys(group).forEach(ele => {
        data.push(group[ele])
    })


    res.status(200).json({ data: data })
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


    if (count.length == 0) {
        res.status(200).json([])
    } else {

        res.status(200).json({ data: locationData, count: count.length })
    }
}