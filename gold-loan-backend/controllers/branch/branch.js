const models = require('../../models');
const sequelize = models.sequelize;
const paginationFUNC = require('../../utils/pagination'); // importing pagination function
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;


//Add branch
exports.addBranch = async(req, res) => {
        const { partnerId, name, cityId, stateId, address, pincode, commission, isActive } = req.body;
        await sequelize.transaction(async t => {

            let addBranch = await models.branch.create({ partnerId, name, cityId, stateId, address, pincode, commission, isActive }, { transaction: t });
            let id = addBranch.dataValues.id;

            let partnerdataid = await models.partner.findOne({ where: { id: addBranch.dataValues.partnerId }, transaction: t });

            let pqid = partnerdataid.dataValues.partnerId;
            let newId = pqid.slice(0, 2) + addBranch.dataValues.name.slice(0, 3).toUpperCase() + '-' + id;
            await models.branch.update({ branchId: newId }, { where: { id }, transaction: t });
            return addBranch;
        }).then((addBranch) => {
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
        let readBranchData = await models.branch.findAll({
            where: searchQuery,
            include:{
                model:models.partner,
                as:'partner'
            },
            offset: offset,
            limit: pageSize
        });
        let count = await models.branch.findAll({
            where: {isActive:true},
            offset: offset,
            limit: pageSize
        });
        if (!readBranchData) { return res.status(404).json({ message: 'data not found' }) }
        return res.status(200).json({data:readBranchData, count:count.length});
      }

//get branch by id

exports.readBranchById = async(req, res) => {
    const branchId = req.params.id;
    let branchData = await models.branch.findOne({
        where: { id: branchId, isActive: true },
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

    if (!branchData[0]) { return res.status(404).json({ message: 'data not found' }) }

    return res.status(200).json(branchData);


}

// update branch 

exports.updateBranch = async(req, res) => {
    const branchId = req.params.id;

    const { partnerId, name, cityId, stateId, address, pincode, commission, isActive } = req.body;
    let pId = name.slice(0, 3).toUpperCase() + '-' + branchId;


    let branchData = await models.branch.update({ partnerId, branchId: pId, name, cityId, stateId, address, pincode, commission, isActive }, { where: { id:branchId, isActive: true } });
    if (!branchData[0]) {
        return res.status(404).json({ message: 'data not found' });
    }
    return res.status(200).json({ message: "Success" });
}

// delete branch

exports.deleteBranch = async(req, res) => {
    const branchId = req.params.id;
    let branchData = await models.branch.update({ isActive: false }, { where: { id:branchId ,isActive:true} });
    if (!branchData[0]) {
        return res.status(404).json({ message: 'data not found' });
    }
    return res.status(200).json({ message: 'Success' })
}
