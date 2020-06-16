const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');
const { paginationWithFromTo } = require("../../utils/pagination");


exports.addLead = async (req, res, next) => {
    let { leadName } = req.body;
    let leadExist = await models.lead.findOne({ where: {isActive: true, leadName: leadName } })
    if (!check.isEmpty(leadExist)) {
        return res.status(404).json({ message: 'This lead is already Exist' });
    }
    let lead = await models.lead.create({ leadName })
    return res.status(200).json({ message: `Created` })
}

exports.getLead = async (req, res, next) => {
    let { getAll } = req.query;
    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
      );

      const searchQuery = {
        [Op.or]: {
            leadName: { [Op.iLike]: search + "%" },
        },
        isActive: true,
    };
    let whereCondition;
    if (getAll == "true") {
        whereCondition = {  where: { isActive: true }, order: [['id', 'DESC']] }
    } else if (getAll == "false") {
        whereCondition = { where: { isActive: true }, order: [['id', 'DESC']] }
    } else if (getAll == undefined) {
        if (offset !== 1 && pageSize !== -1 ) { 
        whereCondition = { 
            where: searchQuery, 
            order: [['id', 'DESC']],
            offset: offset,
            limit: pageSize, }
        } else {
            whereCondition = { where: { isActive: true }, order: [['id', 'DESC']] } 
        }
    }
    let allLead = await models.lead.findAll(whereCondition)
    let count = await models.lead.findAll({
        where: searchQuery,
      });
      if (allLead.length == 0) {
        return res.status(200).json({ data: [] });
      }
      if (offset !== 1 && pageSize !== -1 ) { 
        return res.status(200).json({ data: allLead, count: count.length });
      } else {
        return res.status(200).json({ data: allLead });

      }

}

exports.updateLead = async (req, res, next) => {
    let { leadName } = req.body;
    let { id } = req.params;

    let leadExist = await models.lead.findOne({ where: { leadName: leadName } })
    if (!check.isEmpty(leadExist)) {
        return res.status(404).json({ message: 'This Lead is already Exist' });
    }
    let UpdateData = await models.lead.update({ leadName }, { where: { id: id } })
    if (UpdateData[0] === 0) {
        return res.status(404).json({ message: 'Data not updated' });
    }
    return res.status(200).json({ message: 'Success' });

}

exports.deactivateLead = async (req, res, next) => {
    const { id, isActive } = req.query;
    const lead = await models.lead.update({ isActive: isActive }, { where: { id: id } })
    if (lead[0] == 0) {
        return res.status(404).json({ message: "lead deleted failed" });
    }
    return res.status(200).json({ message: `Updated` })

}