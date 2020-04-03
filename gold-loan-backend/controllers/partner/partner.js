const models = require('../../models');
const sequelize = models.sequelize;
const paginationFUNC = require('../../utils/pagination'); // importing pagination function
const Sequelize=models.Sequelize;
const Op=Sequelize.Op;


//add partner
exports.addPartner = async(req, res) => {

        const { name, commission, isActive } = req.body;
        await sequelize.transaction(async t => {

            let partnerdata = await models.partner.create({ name, commission, isActive }, { transaction: t });
            let id = partnerdata.dataValues.id;
            let partnerId = partnerdata.dataValues.name.slice(0, 3).toUpperCase() + '-' + id;
            await models.partner.update({ partnerId: partnerId }, { where: { id: id }, transaction: t });
            return partnerdata;
        }).then((partnerdata) => {
            return res.status(201).json({ messgae: "partner created" });
        }).catch((exception) => {
            return res.status(500).json({
                message: "something went wrong",
                data: exception.message
            });
        })

    }
    //update partner

exports.updatePartner = async(req, res) => {
    const partnerId = req.params.id;
    const { name, commission, isActive } = req.body;
    let pId = name.slice(0, 3).toUpperCase() + '-' + partnerId;

    let data = await models.partner.update({ name, partnerId: pId, commission, isActive }, { where: { id: partnerId, isActive: true } });
    if (!data[0]) { return res.status(404).json({ message: 'Data not found' }) }

    return res.status(200).json({ message: 'Success' });
}

//get partner

exports.readPartner = async(req, res) => {

    const { search, offset, pageSize } =
    paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);
    const searchQuery = {
        [Op.or]: {
            name: { [Op.iLike]: search + '%' }
        },
        isActive: true 
    }
        let readpartnerdata = await models.partner.findAll({
            where: searchQuery,
            offset: offset,
            limit: pageSize
        });
        let count = await models.partner.findAll({
            where: {isActive:true},
            offset: offset,
            limit: pageSize
        });
        if (!readpartnerdata) { return res.status(404).json({ message: 'data not found' }) }
        return res.status(200).json({data:readpartnerdata, count:count.length});
      }

    //get partner by id

exports.readPartnerById = async(req, res) => {
    const id = req.params.id;
    let partnerdata = await models.partner.findOne({ where: { id, isActive: true } });
    if (!partnerdata) {
        return res.status(404).json({ message: 'data not found' });
    }
    return res.status(200).json(partnerdata);
}

//delete partner by id 

exports.deletePartner = async(req, res) => {
    const id = req.params.id;
    let partnerdata = await models.partner.update({ isActive: false }, { where: { id,isActive:true } });

    if (!partnerdata[0]) {
        return res.status(404).json({ message: 'data not found' });
    }

    return res.status(200).json({ message: 'Success' });
}