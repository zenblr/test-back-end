const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION

const check = require("../../lib/checkLib"); // IMPORTING CHECKLIB 



//  FUNCTION FOR ADD PACKET
exports.addScrapPacket = async (req, res, next) => {

    let { packetUniqueId, internalUserBranchId } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let packetExist = await models.scrapPacket.findOne({ where: { packetUniqueId, isActive: true } });

    if (!check.isEmpty(packetExist)) {
        return res.status(400).json({ message: `This packet Id is already exist` })
    }
    let packetAdded = await models.scrapPacket.addPacket(
        packetUniqueId, createdBy, modifiedBy, internalUserBranchId);
    res.status(201).json({ message: 'you adeed packet successfully' });
        console.log(packetAdded)
}


//  FUNCTION FOR VIEW PACKET
exports.viewScrapPacket = async (req, res, next) => {
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let query = {};
    // if (req.query.packetAssigned) {
    //     query.packetAssigned = req.query.packetAssigned;
    // }
    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                "$customer.customer_unique_id$": { [Op.iLike]: search + '%' },
                "$internalBranch.name$": {
                    [Op.iLike]: search + "%",
                  },
                packetUniqueId: { [Op.iLike]: search + '%' },
            },
        }],
        isActive: true,
    };

    let associateModel = [
        {
            model: models.customer,
            required: false,
            as: 'customer',
            where: { isActive: true },
            attributes: ['id', 'customerUniqueId']
        },
        {
            model: models.internalBranch,
            required: false,
            as: 'internalBranch',
            where: { isActive: true },
            attributes: ['id', 'internalBranchUniqueId', 'name']
        }
    ];

    let packetDetails = await models.scrapPacket.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
        order: [["updatedAt", "DESC"]],
        offset: offset,
        limit: pageSize,

    });
    let count = await models.scrapPacket.count({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
    });

    return res.status(200).json({ message: 'packet details fetch successfully', packetDetails, count: count });

}


//  FUNCTION FOR GET AVAILABLE PACKET
exports.availableScrapPacket = async (req, res, next) => {
    let data = await models.user.findOne({
        where: {
            id: req.userData.id
        },
        include: [{
            model: models.internalBranch,
        }]
    });
    let internalBranchId = [];
    for (let idData of data.internalBranches) {
        internalBranchId.push(idData.id);
    }

    let availablePacketDetails = await models.scrapPacket.findAll({
        where: { isActive: true, packetAssigned: false, internalUserBranchId: { [Op.in]: internalBranchId } },
    });
    if (availablePacketDetails.length === 0) {
        res.status(200).json({ message: 'no packet details found', data: [] });
    } else {
        res.status(200).json({ message: 'avalable packet details fetch successfully', data: availablePacketDetails });
    }
}


// FUNCTION TO ASSIGN PACKET
// exports.assignPacket = async (req, res, next) => {
//     let id = req.params.id;
//     let { customerId, loanId, ornamentTypeId } = req.body;
//     let modifiedBy = req.userData.id;

//     let packet = await models.packet.assignPacket(customerId, loanId, modifiedBy, id);

//     let data = [];
//     for (let ornament of ornamentTypeId) {
//         let single = {}
//         single["packetId"] = id;
//         single["ornamentTypeId"] = ornament;
//         data.push(single);
//     }
//     await models.packetOrnament.bulkCreate(data);

//     if (packet[0] == 0) {
//         return res.status(404).json({ message: "not assigned packet" });
//     }
//     return res.status(200).json({ message: "packet assigned successfully" });
// };


// FUNCTION TO UPDATE PACKET
exports.changePacket = async (req, res, next) => {
        let id = req.params.id;
        let { packetUniqueId, internalUserBranchId } = req.body;
        let modifiedBy = req.userData.id;
    
        let packet = await models.scrapPacket.updatePacket(id, packetUniqueId, internalUserBranchId, modifiedBy);
    
        if (packet[0] == 0) {
            return res.status(404).json({ message: "packet not update" });
        }
        return res.status(200).json({ message: "packet updated successfully" });
   
};


// FUNCTION TO REMOVE PACKET
exports.deletePacket = async (req, res, next) => {
        const id = req.params.id;
        let modifiedBy = req.userData.id;
        const packet = await models.scrapPacket.update({ isActive: false, modifiedBy }, { where: { id: id } })
    
        if (packet[0] == 0) {
            return res.status(404).json({ message: "packet not delete" });
        }
        return res.status(200).json({ message: "packet deleted successfully" });
   
};
