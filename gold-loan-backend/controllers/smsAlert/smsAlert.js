const models = require('../../models');
const paginationFUNC = require("../../utils/pagination");
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

exports.addSmsAlert = async (req, res, next) => {
    const { alertFor, content } = req.body;
    let createdBy = req.userData.id;
    let updatedBy = req.userData.id;
    let addSmsAlert = await models.smsAlert.create({ alertFor, content, createdBy, updatedBy });
    if (!addSmsAlert) { return res.status(422).json({ message: 'sms alert not created' }); }
    return res.status(201).json({ message: 'sms alert created' });
}


exports.readSmsAlert = async (req, res, next) => {
    const { search, offset, pageSize } = paginationFUNC.paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );
    const searchQuery = {
        [Op.or]:
        {
            alertFor: { [Op.iLike]: search + "%" },
            content: { [Op.iLike]: search + "%" }
        },
        isActive: true,
    };
    const smsAlert = await models.smsAlert.findAll({
        where: searchQuery,
        order: [["updatedAt", "DESC"]],
        offset: offset,
        limit: pageSize,
        attributes: ['id', 'alertFor', 'content']
    });
    const count = await models.smsAlert.findAll({
        where: searchQuery
    });
    return res.status(200).json({
        data: smsAlert,
        count: count.length
    });
}

exports.readSmsAlertById = async (req, res) => {
    const smsAlertId = req.params.id;
    const readSmsAlertById = await models.smsAlert.findOne({
        where: { id: smsAlertId, isActive: true },
        attributes: ['id', 'alertFor', 'content']
    });
    if (!readSmsAlertById) {
        return res.status(404).json({ message: 'data not found' });
    }
    return res.status(200).json(readSmsAlertById);
}


exports.updateSmsAlert = async (req, res, next) => {
    const smsAlertId = req.params.id;
    let updatedBy = req.userData.id;
    const { content } = req.body;
    let updateSmsAlertData = await models.smsAlert.update({ content, updatedBy }, { where: { id: smsAlertId, isActive: true } });
    if (!updateSmsAlertData[0]) {
        return res.status(404).json({ message: 'sms alert updated failed' });
    }
    return res.status(200).json({ message: 'updated' });
}


