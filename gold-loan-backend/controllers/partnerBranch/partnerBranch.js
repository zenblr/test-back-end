const models = require('../../models');
const sequelize = models.sequelize;
const paginationFUNC = require('../../utils/pagination'); // importing pagination function
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

const check = require('../../lib/checkLib')

//Add branch
exports.addBranch = async (req, res, next) => {
    const { partnerId, name, cityId, stateId, address, pinCode, isActive } = req.body;

    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    await sequelize.transaction(async t => {

        let addBranch = await models.partnerBranch.create({ partnerId, name, cityId, stateId, address, pinCode, createdBy, modifiedBy, isActive }, { transaction: t });
        let id = addBranch.dataValues.id;

        let partnerdataid = await models.partner.findOne({ where: { id: addBranch.dataValues.partnerId }, transaction: t });

        let pqid = partnerdataid.dataValues.partnerId;
        let newId = pqid.slice(0, 2) + addBranch.dataValues.name.slice(0, 3).toUpperCase() + '-' + id;
        await models.partnerBranch.update({ branchId: newId }, { where: { id }, transaction: t });
        return addBranch;
    })
    return res.status(201).json({ message: "branch created" })

}

//get branch
exports.readBranch = async (req, res, next) => {
    let { cityId, stateId, partnerId } = req.query;

    const { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let query = {};
    if (cityId) {
        cityId = req.query.cityId.split(",");
        query.cityId = cityId;
    }
    if (stateId) {
        stateId = req.query.stateId.split(",");
        query.stateId = stateId;
    }
    if (partnerId) {
        partnerId = req.query.partnerId.split(",");
        query.partnerId = partnerId;
    }

    const searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                name: { [Op.iLike]: search + '%' },
                branchId: { [Op.iLike]: search + '%' },
                "$partner.name$": {
                    [Op.iLike]: search + "%",
                },
                pinCode: sequelize.where(
                    sequelize.cast(sequelize.col("pin_code"), "varchar"),
                    {
                        [Op.iLike]: search + "%"
                    }),
                "$city.name$": {
                    [Op.iLike]: search + "%",
                },
                "$state.name$": {
                    [Op.iLike]: search + "%",
                }
            },
        }],
        isActive: true
    }
    const includeArray = [
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
    ]

    let readBranchData = await models.partnerBranch.findAll({
        where: searchQuery,
        include: includeArray,
        order: [
            ['id', 'DESC']
        ],
        offset: offset,
        limit: pageSize
    });
    let count = await models.partnerBranch.count({
        where: searchQuery,
        include: includeArray
    });

    if (!readBranchData) { return res.status(200).json({ message: 'data not found' }) }
    return res.status(200).json({ data: readBranchData, count: count });
}

//get branch by id

exports.readBranchById = async (req, res, next) => {
    const branchId = req.params.id;
    let branchData = await models.partnerBranch.findOne({
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

    let modifiedBy = req.userData.id;

    const { partnerId, name, cityId, stateId, address, pinCode, isActive } = req.body;
    // let pId = name.slice(0, 3).toUpperCase() + '-' + branchId;


    let branchData = await models.partnerBranch.update({ partnerId, name, cityId, stateId, address, pinCode, modifiedBy, isActive }, { where: { id: branchId, isActive: true } });
    if (branchData[0] == 0) {
        return res.status(404).json({ message: " Update failed" });
    }
    return res.status(200).json({ message: "Success" });
}

// delete branch

exports.deleteBranch = async (req, res, next) => {
    const { id, isActive } = req.query;
    let branch = await models.partnerBranch.update({ isActive: isActive }, { where: { id: id } })
    if (branch[0] == 0) {
        return res.status(404).json({ message: "branch deleted failed" });
    }
    return res.status(200).json({ message: `Updated` })

}
