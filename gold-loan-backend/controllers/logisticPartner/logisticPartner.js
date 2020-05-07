const models = require('../../models');
const { paginationWithFromTo } = require("../../utils/pagination");


// add logistic partner

exports.addLogisticPartner = async (req, res) => {
    const { name } = req.body;
    let modifiedBy=req.userData.id;
    let createdBy=req.userData.id;
    let addLogisticPartner = await models.logisticPartner.create({ name,modifiedBy,createdBy });
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
        name: { [Op.iLike]: search + "%" },
        isActive: true
    }

    let allLogisticPartner = await models.logisticPartner.findAll({
        where: searchQuery,
        offset: offset,
        limit: pageSize
    });
    let count = await models.logisticPartner.count({
        where: searchQuery
    });
    if (!allLogisticPartner[0]) {
        return res.status(404).json({ message: 'data not found' });
    }
    return res.status(200).json({ data: allLogisticPartner, count: count });
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
    const { id } = req.query;
    let deactiveLogisticPartner = await models.logisticPartner.update({ isActive: false }, { where: { id,isActive:true } });
    if (!deactiveLogisticPartner[0]) { return res.status(404).json({ message: 'logistic partner delete failed ' }) }
    return res.status(200).json({ message: 'Updated' })
}