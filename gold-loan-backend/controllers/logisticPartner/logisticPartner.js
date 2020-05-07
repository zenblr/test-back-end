const models = require('../../models');
const check = require('../../lib/checkLib');
const {paginationWithFromTo} = require("../../utils/pagination");   
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
// add logistic partner

exports.addLogisticPartner = async (req, res) => {
    const { name } = req.body;
    let logisticPartnerExist = await models.logisticPartner.findOne({ where: { name, isActive: true } });
    if (!check.isEmpty(logisticPartnerExist)) {
        return res.status(400).json({ message: 'logistic partner is not exist' });
    }
    let addLogisticPartner = await models.logisticPartner.create({ name });
    if (!addLogisticPartner) { return res.status(404).json({ message: 'logistic partner is not created' }) }
    return res.status(201).json({ message: 'logistic partner created' });

}

// get logistic partner

exports.readLogisticPartner = async (req, res) => {
    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );
    const searchQuery = {
        [Op.or]: {
            name: { [Op.iLike]: search + "%" },
        },
        isActive:true
    }

  let allLogisticPartner = await models.logisticPartner.findAll({
    where: searchQuery,
    offset: offset,
    limit: pageSize  });
  let count = await models.logisticPartner.count({
    where: searchQuery
  });

    // let readLogisticPartnerData= await models.logisticPartner.findAll({ where: { isActive: true } },
    // );
    if (!allLogisticPartner[0]) {
        return res.status(404).json({ message: 'data not found' });
    }
    return res.status(200).json({data:allLogisticPartner,count:count});
}

// get logistic partner by id

exports.readLogisticPartnerById = async (req, res) => {
    let logisticPartnerId = req.params.id;
    let readLogisticPartnerById = await models.logisticPartner.findOne({ where: { id: logisticPartnerId, isActive: true } });
    if (!readLogisticPartnerById) { return res.status(404).json({ message: 'data not found' }) }
    return res.status(200).json(readLogisticPartnerById);
}

//update logistic partner by id

exports.updateLogisticPartner = async (req, res) => {
    let logisticPartnerId = req.params.id;
    const { name } = req.body;
    let updateLogisticPartner = await models.logisticPartner.update({ name }, { where: { id: logisticPartnerId, isActive: true } });
    if (!updateLogisticPartner[0]) { return res.status(404).json({ message: 'logistic Partner update failed' }) }
    return res.status(200).json({ message: 'updated' })
}

// deactive logistic partner 

exports.deactiveLogisticPartner = async (req, res) => {
    const { id, isActive } = req.query;
    let deactiveLogisticPartner = await models.logisticPartner.update({ isActive: isActive }, { where: { id } });
    if (!deactiveLogisticPartner[0]) { return res.status(404).json({ message: 'logistic partner delete failed ' }) }
    return res.status(200).json({ message: 'Updated' })
}