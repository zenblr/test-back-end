const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION

const check = require("../../lib/checkLib"); // IMPORTING CHECKLIB 



//  FUNCTION FOR ADD PACKET
exports.addPacket = async (req, res, next) => {

    let { packetUniqueId } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let packetExist = await models.packet.findOne({ where: { packetUniqueId } })

    if (!check.isEmpty(packetExist)) {
        return res.status(400).json({ message: `This packet Id is already exist` })
    }
    let packetAdded = await models.packet.addPacket(
        packetUniqueId, createdBy, modifiedBy);
    res.status(201).json({ message: 'you adeed packet successfully' });
}


//  FUNCTION FOR VIEW PACKET
exports.viewPacket = async (req, res, next) => {
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let query = {};
    if (req.query.packetAssigned) {
        query.packetAssigned = req.query.packetAssigned;
    }
    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                "$customerLoan.loan_unique_id$": { [Op.iLike]: search + '%' },
                "$customer.customer_unique_id$": { [Op.iLike]: search + '%' },
                packetUniqueId: { [Op.iLike]: search + '%' },
            },
        }],
        isActive: true,
    };

    let associateModel = [{
        model: models.customer,
        required: false,
        as: 'customer',
        where: { isActive: true },
        attributes: ['id', 'customerUniqueId']
    },
    {
        model: models.customerLoan,
        required: false,
        as: 'customerLoan',
        where: { isActive: true },
        attributes:['id','loanUniqueId']
    }];

    let packetDetails = await models.packet.findAll({
        where: searchQuery,
        include: associateModel,
        order: [
            ['id', 'DESC']
        ],
        offset: offset,
        limit: pageSize,

    });
    let count = await models.packet.count({
        where: searchQuery,
        include: associateModel,
    });

    return res.status(200).json({ message: 'packet details fetch successfully', packetDetails, count: count });

}


//  FUNCTION FOR GET AVAILABLE PACKET
exports.availablePacket = async (req, res, next) => {
    let availablePacketDetails = await models.packet.findAll({
        where: { isActive: true, packetAssigned: false },
    });
    if (availablePacketDetails.length === 0) {
        res.status(404).json({ message: 'no packet details found' });
    } else {
        res.status(200).json({ message: 'avalable packet details fetch successfully', data: availablePacketDetails });
    }
}


// FUNCTION TO ASSIGN PACKET
exports.assignPacket = async (req, res, next) => {
    let id = req.params.id;
    let { customerId, loanId } = req.body;
    let modifiedBy = req.userData.id;

    let packet = await models.packet.assignPacket(customerId, loanId, modifiedBy, id);

    if (packet[0] == 0) {
        return res.status(404).json({ message: "not assigned packet" });
    }
    return res.status(200).json({ message: "packet assigned successfully" });
};


// FUNCTION TO UPDATE PACKET
exports.changePacket = async (req, res, next) => {
    let id = req.params.id;
    let { packetUniqueId } = req.body;
    let modifiedBy = req.userData.id;

    let packet = await models.packet.updatePacket(id, packetUniqueId, modifiedBy);

    if (packet[0] == 0) {
        return res.status(404).json({ message: "packet not update" });
    }
    return res.status(200).json({ message: "packet updated successfully" });
};


// FUNCTION TO REMOVE PACKET
exports.deletePacket = async (req, res, next) => {

    const { id, isActive } = req.query;
    let modifiedBy = req.userData.id;
    const packet = await models.packet.update({ isActive: isActive, modifiedBy }, { where: { id: id } })

    if (packet[0] == 0) {
        return res.status(404).json({ message: "packet not delete" });
    }
    return res.status(200).json({ message: "packet deleted successfully" });
};