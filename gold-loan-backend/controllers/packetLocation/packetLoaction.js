const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');
const { paginationWithFromTo } = require("../../utils/pagination");


exports.addPacketLocation = async (req, res, next) => {
    let { location } = req.body;
    let pocketExist = await models.packetLocation.findOne({ where: {isActive: true, location: location } })
    if (!check.isEmpty(pocketExist)) {
        return res.status(404).json({ message: 'This Packet Location already Exists' });
    }
    let pocket = await models.packetLocation.create({ location })
    return res.status(200).json({ message: `Created` })
}

exports.getPacketLocation = async (req, res, next) => {
    let { getAll } = req.query;
    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
      );

      const searchQuery = {
        [Op.or]: {
            location: { [Op.iLike]: search + "%" },
        },
        isActive: true,
    };
    let whereCondition;
    if (getAll == "true") {
        whereCondition = {  where: { isActive: true }, order: [["updatedAt", "DESC"]] }
    } else if (getAll == "false") {
        whereCondition = { where: { isActive: true }, order: [["updatedAt", "DESC"]] }
    } else if (getAll == undefined) {
        if (offset !== 1 && pageSize !== -1 ) { 
        whereCondition = { 
            where: searchQuery, 
            order: [["updatedAt", "DESC"]],
            offset: offset,
            limit: pageSize, }
        } else {
            whereCondition = { where: { isActive: true }, order: [["updatedAt", "DESC"]] } 
        }
    }
    let allPocket = await models.packetLocation.findAll(whereCondition)
    let count = await models.packetLocation.findAll({
        where: searchQuery,
      });
      if (allPocket.length == 0) {
        return res.status(200).json({ data: [] });
      }
      if (offset !== 1 && pageSize !== -1 ) { 
        return res.status(200).json({ data: allPocket, count: count.length });
      } else {
        return res.status(200).json({ data: allPocket });

      }

}

exports.updatePacketLocation = async (req, res, next) => {
    let { location } = req.body;
    let { id } = req.params;

    let pocketExist = await models.packetLocation.findOne({ where: { location: location, isActive: true } })
    if (!check.isEmpty(pocketExist)) {
        return res.status(404).json({ message: 'This Packet Location already Exists' });
    }
    let UpdateData = await models.packetLocation.update({ location }, { where: { id: id } })
    if (UpdateData[0] === 0) {
        return res.status(404).json({ message: 'Data not updated' });
    }
    return res.status(200).json({ message: 'Success' });

}

exports.deactivatePacketLoaction = async (req, res, next) => {
    const { id, isActive } = req.query;
    const pocket = await models.packetLocation.update({ isActive: isActive }, { where: { id: id } })
    if (pocket[0] == 0) {
        return res.status(404).json({ message: "pocket location deleted failed" });
    }
    return res.status(200).json({ message: `Updated` })

}