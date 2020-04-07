const models = require('../../models');
const sequelize = models.sequelize;
const paginationFUNC = require('../../utils/pagination'); // importing pagination function
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;


//Add branch
exports.addBranch = async(req, res) => {
        const { partnerId, name, cityId, stateId, address, pincode, commission, isActive } = req.body;
        await sequelize.transaction(async t => {

            let addbranch = await models.branch.create({ partnerId, name, cityId, stateId, address, pincode, commission, isActive }, { transaction: t });
            let id = addbranch.dataValues.id;

            let partnerdataid = await models.partner.findOne({ where: { id: addbranch.dataValues.partnerId }, transaction: t });

            let pqid = partnerdataid.dataValues.partnerId;
            let newId = pqid.slice(0, 2) + addbranch.dataValues.name.slice(0, 3).toUpperCase() + '-' + id;
            await models.branch.update({ branchId: newId }, { where: { id }, transaction: t });
            return addbranch;
        }).then((addbranch) => {
            return res.status(201).json({ messgae: "branch created" })
        }).catch((exception) => {

            return res.status(500).json({
                message: "something went wrong",
                data: exception.message

            });
        })
}

//get branch
exports.readBranch = async(req, res) => {
  
    const { search, offset, pageSize } =
    paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);
    const searchQuery = {
        [Op.or]: {
            name: { [Op.iLike]: search + '%' }
        },
        isActive: true 
    }
        let readbranchdata = await models.branch.findAll({
            where: searchQuery,
            offset: offset,
            limit: pageSize
        });
        let count = await models.branch.findAll({
            where: {isActive:true},
            offset: offset,
            limit: pageSize
        });
        if (!readbranchdata) { return res.status(404).json({ message: 'data not found' }) }
        return res.status(200).json({data:readbranchdata, count:count.length});
      }

//get branch by id

exports.readBranchById = async(req, res) => {
    const id = req.params.id;
    let branchdata = await models.branch.findOne({
        where: { id: id, isActive: true },
        include: [{
                model: models.partner,
                as: "partner",
                where: {
                    isActive: true
                }
            },
            {
                model: models.cities,
                as: "cities",
                where: {
                    isActive: true
                }
            },
            {
                model: models.states,
                as: "states",
                where: {
                    isActive: true
                }
            }
        ]
    });

    if (!branchdata) { return res.status(404).json({ message: 'data not found' }) }

    return res.status(200).json(branchdata);


}

// update branch 

exports.updateBranch = async(req, res) => {
    const id = req.params.id;

    const { partnerId, name, cityId, stateId, address, pincode, commission, isActive } = req.body;
    let pId = name.slice(0, 3).toUpperCase() + '-' + id;


    let branchdata = await models.branch.update({ partnerId, branchId: pId, name, cityId, stateId, address, pincode, commission, isActive }, { where: { id, isActive: true } });
    if (!branchdata[0]) {
        return res.status(404).json({ message: 'data not found' });
    }
    return res.status(200).json({ message: "Success" });
}

// delete branch

exports.deleteBranch = async(req, res) => {
    const id = req.params.id;
    let branchdata = await models.branch.update({ isActive: false }, { where: { id ,isActive:true} });
    if (!branchdata[0]) {
        return res.status(404).json({ message: 'data not found' });
    }
    return res.status(200).json({ message: 'Success' })
}
