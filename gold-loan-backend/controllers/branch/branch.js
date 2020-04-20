const models = require('../../models');
const sequelize = models.sequelize;
const paginationFUNC = require('../../utils/pagination'); // importing pagination function
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

const check = require('../../lib/checkLib')

//Add branch
exports.addBranch = async (req, res, next) => {
    const { partnerId, name, cityId, stateId, address, pincode, commission, isActive } = req.body;
    await sequelize.transaction(async t => {

        let addBranch = await models.branch.create({ partnerId, name, cityId, stateId, address, pincode, commission, isActive }, { transaction: t });
        let id = addBranch.dataValues.id;

        let partnerdataid = await models.partner.findOne({ where: { id: addBranch.dataValues.partnerId }, transaction: t });

        let pqid = partnerdataid.dataValues.partnerId;
        let newId = pqid.slice(0, 2) + addBranch.dataValues.name.slice(0, 3).toUpperCase() + '-' + id;
        await models.branch.update({ branchId: newId }, { where: { id }, transaction: t });
        return addBranch;
    })
    return res.status(201).json({ message: "branch created" })

}

//get branch
exports.readBranch = async (req, res, next) => {

    const { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);
    const searchQuery = {
        [Op.or]: {
            name: { [Op.iLike]: search + '%' },
            branchId: { [Op.iLike]: search + '%' },
            name: sequelize.where(
                sequelize.cast(sequelize.col("partner.name"), "varchar"),
                {
                    [Op.iLike]: search + "%"
                }),
            pincode: sequelize.where(
                sequelize.cast(sequelize.col("branch.pincode"), "varchar"),
                {
                    [Op.iLike]: search + "%"
                }),
            city_name: sequelize.where(
                sequelize.cast(sequelize.col("city.name"), "varchar"),
                {
                    [Op.iLike]: search + "%"
                }),
            state_name: sequelize.where(
                sequelize.cast(sequelize.col("state.name"), "varchar"),
                {
                    [Op.iLike]: search + "%"
                }),
        },
        isActive: true
    }
    let readBranchData = await models.branch.findAll({
        where: searchQuery,
        include: [
            {
                model: models.partner,
                as: 'partner'
            }, {
                model: models.city,
                as: "city",
                where: {
                    isActive: true
                }
            }, {
                model: models.state,
                as: "state",
                where: {
                    isActive: true
                }
            }
        ],
        order: [
            ['id', 'DESC']
        ],
        offset: offset,
        limit: pageSize
    });
    let count = await models.branch.findAll({
        where: searchQuery,
        include: [
            {
                model: models.partner,
                as: 'partner'
            }, {
                model: models.city,
                as: "city",
                where: {
                    isActive: true
                }
            }, {
                model: models.state,
                as: "state",
                where: {
                    isActive: true
                }
            }
        ],
    });
    if (!readBranchData) { return res.status(404).json({ message: 'data not found' }) }
    return res.status(200).json({ data: readBranchData, count: count.length });
}

//get branch by id

exports.readBranchById = async (req, res, next) => {
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
            model: models.city,
            as: "city",
            where: {
                isActive: true
            }
        },
        {
            model: models.state,
            as: "state",
            where: {
                isActive: true
            }
        }
        ]
    });
    if (check.isEmpty(branchData)) {
        return res.status(404).json({ message: 'data not found' })
    }

    return res.status(200).json(branchData);


}

// update branch 

exports.updateBranch = async (req, res, next) => {
    const branchId = req.params.id;

    const { partnerId, name, cityId, stateId, address, pincode, commission, isActive } = req.body;
    let pId = name.slice(0, 3).toUpperCase() + '-' + branchId;


    let branchData = await models.branch.update({ partnerId, branchId: pId, name, cityId, stateId, address, pincode, commission, isActive }, { where: { id: branchId, isActive: true } });
    if (branchData[0] == 0) {
        return res.status(404).json({ message: " Update failed" });
    }
    return res.status(200).json({ message: "Success" });
}

// delete branch

exports.deleteBranch = async (req, res, next) => {
    const { id, isActive } = req.query;
    let branch = await models.branch.update({ isActive: isActive }, { where: { id: id } })
    if (branch[0] == 0) {
        return res.status(404).json({ message: "branch deleted failed" });
    }
    return res.status(200).json({ message: `Updated` })

}
