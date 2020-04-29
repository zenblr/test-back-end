const models = require('../../models');
const check = require('../../lib/checkLib');
const sequelize = models.sequelize;
const paginationFUNC = require('../../utils/pagination'); // importing pagination function
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

// add internal branch

exports.addInternalBranch = async (req, res) => {
    const { name, cityId, stateId, address, pinCode } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;


    await sequelize.transaction(async t => {
        let nameExist = await models.internalBranch.findOne({ where: { name,isActive:true} })

        if (!check.isEmpty(nameExist)) {
            return res.status(404).json({ message: "Your internal branch name is already exist." });
        }

        let addInternalBranch = await models.internalBranch.create({ name, cityId, stateId, address, pinCode, createdBy, modifiedBy }, { transaction: t });
        let id = addInternalBranch.dataValues.id;
        let newId = addInternalBranch.dataValues.name.slice(0, 3).toUpperCase() + '-' + id;
        console.log(newId);
        await models.internalBranch.update({ internalBranchUniqueId: newId }, { where: { id }, transaction: t });
        return addInternalBranch;
    })
    return res.status(201).json({ message: "internal branch created" });

}
// read internal branch
exports.readInternalBranch = async (req, res) => {

    const { search, offset, pageSize } =
    paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    const searchQuery={
        [Op.or]: {
             name: { [Op.iLike]: search + '%' },
            "$Createdby.first_name$": { [Op.iLike]: search + '%' },
            "$ModifiedBy.last_name$":{[op.iLike]: search + '%'}
        },
            isActive:true,
}
let readInternalBranch = await models.internalBranch.findAll({
    where:searchQuery,
    order: [["id", "DESC"]],
    offset:offset,
    limit:pageSize,
    include: [
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
    ],
    subQuery:false


});
let count = await models.internalBranch.count({
    where: searchQuery,
    include: [
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
    ],
  });

  if (!readInternalBranch) {
    res.status(200).json({
      data: [],
      count: 0
    })
}
return res.status(200).json({data:readInternalBranch,count:count});
}



// read internal branch by id

exports.readInternalBranchById = async (req, res) => {
    let internalBranchId = req.params.id;
    let readInternalBranchById = await models.internalBranch.findOne({ where: { id: internalBranchId, isActive: true },  
         include: [
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

    ]});
    if (!readInternalBranchById) {
        return res.status(404).json({ message: 'data not found' });
    }
    return res.status(200).json(readInternalBranchById);
}

// update Internal branch 

exports.updateInternalBranch = async (req, res) => {
    let internalBranchId = req.params.id;
    const { name, cityId, stateId, pinCode } = req.body;
    let nameExist = await models.internalBranch.findOne({ where: { name,isActive:true } })

    if (!check.isEmpty(nameExist)) {
        return res.status(404).json({ message: "Your internal branch name is already exist." });
    }
    let updateInternalBranch = await models.internalBranch.update({ name, cityId, stateId, pinCode },{where:{id:internalBranchId,isActive:true}});
    if (!updateInternalBranch[0]) {
        return res.status(404).json({ message: 'internal branch updated failed' });
    }
    return res.status(200).json({ message: 'Updated' });
}

// deactive internal branch

exports.deactiveInternalBranch = async (req, res) => {
    const { id,isActive } = req.query;
    let deactiveInternalBranch = await models.internalBranch.update({ isActive: isActive }, { where: { id } });
    if (!deactiveInternalBranch[0]) {
        return res.status(404).json({ message: 'deleted failed internal branch' })
    }
    return res.status(200).json({ message: 'deleted' });
}
