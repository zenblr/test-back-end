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

//FUNCTION TO GET DETAILS OF PACKET OF SINGLE CUSTOMER 
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

//FUNCTION TO GET LOGS OF PACKET LOCATION
exports.viewLogs = async (req, res) => {
    let { masterLoanId } = req.query

    let { offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.from, req.query.to);

    let stageId = await models.loanStage.findOne({ where: { name: 'disbursed' } })

    let logDetails = await models.customerLoanMaster.findOne({
        attributes: ['id', 'customerId', 'appraiserId', 'operatinalTeamId', 'bmId'],
        where: { loanStageId: stageId.id, id: masterLoanId },
        include: [
            {
                model: models.customerPacketLocation,
                as: 'customerPacketLocation',
                include: [
                    {
                        model: models.pocketLocation,
                        as: 'packetLocation',
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                    },
                ]
            },
            {
                model: models.customer,
                as: 'customer',
                attributes: ['id', 'customerUniqueId', 'firstName', 'lastName'],
            },
            {
                model: models.customerLoan,
                as: 'customerLoan',
                attributes: ['id', 'masterLoanId', 'loanUniqueId', 'loanType'],
            },
            {
                model: models.customerLoanPackageDetails,
                as: 'loanPacketDetails',
                attributes: ['id', 'loanId', 'masterLoanId'],
                include: [{
                    model: models.packet,
                    as: 'packets',
                    attributes: ['id', 'loanId', 'masterLoanId', 'packetUniqueId', 'barcodeNumber'],
                }]
            },
            {
                model: models.user,
                as: 'appraiser',
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: models.user,
                as: 'bm',
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: models.user,
                as: 'operatinalTeam',
                attributes: ['id', 'firstName', 'lastName']
            }

        ],
        offset: offset,
        limit: pageSize,
    });
    return res.status(200).json({ data: logDetails });
}

//FUNCTION TO UPDATE LOCATION OF PACKET
exports.updateLocation = async (req, res) => {
    emitterId = req.userData.id
    let { receiverCustomerId, packetLocationId, receiverUserId, isSelected, loanId, masterLoanId } = req.body;

    let packetLocationData = await models.customerPacketLocation.create({
        receiverCustomerId, packetLocationId, receiverUserId, isSelected, emitterId, loanId, masterLoanId
    });

    if (packetLocationData) {
        return res.status(201).json({ message: 'Loaction Added' });
    } else {
        return res.status(400).json({ message: 'Loaction not added' });
    }
}

