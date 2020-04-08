const models = require('../../models');
const sequelize = models.sequelize;
const paginationFUNC = require('../../utils/pagination'); // importing pagination function
const Sequelize=models.Sequelize;
const Op=Sequelize.Op;

const check = require('../../lib/checkLib')



//add partner
exports.addPartner = async(req, res, next) => {

        const { name, commission, isActive } = req.body;
        await sequelize.transaction(async t => {

            let partnerData = await models.partner.create({ name, commission, isActive }, { transaction: t });
            let id = partnerData.dataValues.id;
            let partnerId = partnerData.dataValues.name.slice(0, 3).toUpperCase() + '-' + id;
            await models.partner.update({ partnerId: partnerId }, { where: { id: id }, transaction: t });
            return partnerData;
        }).then((partnerData) => {
            return res.status(201).json({ messgae: "partner created" });
        }).catch((exception) => {
          next(exception)
        })

    }
    //update partner

exports.updatePartner = async(req, res, next) => {
    const partnerId = req.params.id;
    const { name, commission, isActive } = req.body;
    let pId = name.slice(0, 3).toUpperCase() + '-' + partnerId;

    let updatePartnerData = await models.partner.update({ name, partnerId: pId, commission, isActive }, { where: { id: partnerId, isActive: true } });
   
    return res.status(200).json({ message: 'Success' });
}

//get partner

exports.readPartner = async(req, res, next) => {

    if(req.query.from == 1 && req.query.to == -1){
        let readPartnerData = await models.partner.findAll();
        return res.status(200).json({data:readPartnerData});
    }else{
        const { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);
        const searchQuery = {
            [Op.or]: {
                name: { [Op.iLike]: search + '%' }
            },
            isActive: true 
        }
            let readPartnerData = await models.partner.findAll({
                where: searchQuery,
                order: [
                    ['id', 'ASC']
                ],
                offset: offset,
                limit: pageSize
            });
            let count = await models.partner.findAll({
                where: {isActive:true}
            });
            if (!readPartnerData) { return res.status(404).json({ message: 'data not found' }) }
            return res.status(200).json({data:readPartnerData, count:count.length});
    }
   
      }

    //get partner by id

exports.readPartnerById = async(req, res, next) => {
    const partnerId = req.params.id;
    let partnerData = await models.partner.findOne({ where: { id:partnerId, isActive: true } });
    if (check.isEmpty(partnerData)) {
        return res.status(404).json({ message: 'data not found' })
    }
    return res.status(200).json(partnerData);
}

//delete partner by id 

exports.deletePartner = async(req, res, next) => {
    const partnerId = req.params.id;
    let partnerData = await models.partner.update({ isActive: false }, { where: { id:partnerId,isActive:true } });

    if (!partnerData[0]) {
        return res.status(404).json({ message: 'data not found' });
    }

    return res.status(200).json({ message: 'Success' });
}