const models = require('../../models');
const check = require('../../lib/checkLib');
const sequelize = models.sequelize;
const paginationFUNC = require('../../utils/pagination'); // importing pagination function
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const _ = require('lodash');

// add internal branch

exports.addInternalBranch = async (req, res) => {
    const { name, cityId, stateId, address, pinCode, partnerId, ifscCode, bankName, bankBranch, accountHolderName, accountNumber, passbookStatementCheque } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let nameExist = await models.internalBranch.findOne({ where: { name, isActive: true } })

    if (!check.isEmpty(nameExist)) {
        return res.status(404).json({ message: "Your internal branch name is already exist." });
    }

    await sequelize.transaction(async t => {
        let addInternalBranch = await models.internalBranch.create({ name, cityId, stateId, address, pinCode, createdBy, modifiedBy, ifscCode, bankName, bankBranch, accountHolderName, accountNumber, passbookStatementCheque }, { transaction: t });
        let id = addInternalBranch.dataValues.id;
        let newId = addInternalBranch.dataValues.name.slice(0, 3).toUpperCase() + '-' + id;
        await models.internalBranch.update({ internalBranchUniqueId: newId }, { where: { id }, transaction: t });
        for (var i = 0; i < partnerId.length; i++) {
            var data = await models.internalBranchPartner.create({
                internalBranchId: addInternalBranch.id,
                partnerId: partnerId[i]
            }, { transaction: t })
        }
    })
    return res.status(201).json({ message: "Internal branch created" });

}

// read internal branch
exports.readInternalBranch = async (req, res) => {

    if (req.query.from == 1 && req.query.to == -1) {
        // let whereCondition
        // if (check.isEmpty(req.query.cityId)) {
        //     whereCondition = { isActive: true }
        // } else {
        //     whereCondition = { isActive: true, cityId: req.query.cityId }
        // }

        let readInternalBranch = await models.internalBranch.findAll({
            where: { isActive: true },
            include: [
                {
                    model: models.city,
                    as: "city",
                    where: {
                        isActive: true
                    }
                },
            ]
        });
        return res.status(200).json({ data: readInternalBranch });
    } else {

        const { search, offset, pageSize } =
            paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

        const searchQuery = {
            [Op.or]: {
                name: { [Op.iLike]: search + '%' },
                pinCode: sequelize.where(
                    sequelize.cast(sequelize.col("internalBranch.pin_code"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                "$city.name$": { [Op.iLike]: search + '%' },
                "$state.name$": { [Op.iLike]: search + '%' },
                // "$Createdby.first_name$": { [Op.iLike]: search + '%' },
                // "$Modifiedby.first_name$": { [Op.iLike]: search + '%' }
            },
            isActive: true,
        }

        const includeArray = [
            {
                model: models.partner,
                attributes: ['id', 'name', 'partnerId']
            },
            {
                model: models.user,
                as: "Createdby",
                where: {
                    isActive: true
                }
            },
            {
                model: models.user,
                as: "Modifiedby",
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

        let readInternalBranch = await models.internalBranch.findAll({
            where: searchQuery,
            include: includeArray,
            order: [["updatedAt", "DESC"]],
            offset: offset,
            limit: pageSize,
            subQuery: false


        });
        let count = await models.internalBranch.findAll({
            where: searchQuery,
            include: includeArray
        });


        if (!readInternalBranch) {
            res.status(200).json({
                data: [],
                count: 0
            })
        } else {
            return res.status(200).json({ data: readInternalBranch, count: count.length });
        }
    }


}

// read internal branch by id

exports.readInternalBranchById = async (req, res) => {
    let internalBranchId = req.query.id;
    let readInternalBranchById = await models.internalBranch.findOne({
        where: { id: internalBranchId, isActive: true },
        include: [
            {
                model: models.partner,
                attributes: ['id', 'name', 'partnerId']
            },
            {
                model: models.user,
                as: "Createdby",
                where: {
                    isActive: true
                }
            },
            {
                model: models.user,
                as: "Modifiedby",
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
            },
        ]
    });
    if (!readInternalBranchById) {
        return res.status(404).json({ message: 'data not found' });
    }
    return res.status(200).json(readInternalBranchById);
}

// update Internal branch 

exports.updateInternalBranch = async (req, res) => {
    const internalBranchId = req.params.id;
    const { name, cityId, stateId, pinCode, address, partnerId, ifscCode, bankName, bankBranch, accountHolderName, accountNumber, passbookStatementCheque } = req.body;
    let modifiedBy = req.userData.id;
    // if (!updateInternalBranch[0]) {
    //     return res.status(404).json({ message: 'internal branch updated failed' });
    // } else {
    await sequelize.transaction(async t => {

        let updateInternalBranch = await models.internalBranch.update({ name, cityId, stateId, pinCode, address, modifiedBy, ifscCode, bankName, bankBranch, accountHolderName, accountNumber, passbookStatementCheque }, { where: { id: internalBranchId, isActive: true }, transaction: t });
        let readInternalBranchData = await models.internalBranchPartner.findAll({
            where: { internalBranchId: internalBranchId },
            attributes: ['partnerId']
        });
        let oldPartnerId = await readInternalBranchData.map((data) => data.partnerId);
        let deleteValues = await _.difference(oldPartnerId, partnerId);
        let addValues = await _.difference(partnerId, oldPartnerId);
        addValues.map(async (partnerId) => {
            let data = await models.internalBranchPartner.create({ internalBranchId: internalBranchId, partnerId: partnerId }, { transaction: t });
        });
        await models.internalBranchPartner.destroy({ where: { internalBranchId: internalBranchId, partnerId: deleteValues }, transaction: t });
    })

    return res.status(200).json({ message: 'Updated' });
    // }
}

// deactive internal branch

exports.deactiveInternalBranch = async (req, res) => {
    const { id, isActive } = req.query;

    await sequelize.transaction(async t => {
        await models.internalBranch.update({ isActive: isActive }, { where: { id }, transaction: t });
        await models.schemeInternalBranch.destroy({
            where: {
                internalBranchId: id
            }, transaction: t
        });
    })
    return res.status(200).json({ message: 'Updated' });
}
