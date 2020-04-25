const models = require('../../models');
const sequelize = models.sequelize;
const paginationFUNC = require("../../utils/pagination");
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib')
const _ = require('lodash');

//add Role
exports.addRole = async (req, res, next) => {
    const { roleName, description, roleId, moduleId } = req.body;
    let userId = req.userData.id;
    let addRole = await models.role.addRole(roleName, description, userId, userId);
    if (!addRole) {
        res.status(422).json({ message: "failed to create role" });
    } else {
        moduleId.map(async (moduleId) => {
            await models.roleModule.addRoleModule( addRole.id, moduleId );
          });
        if (!roleId) {
            res.status(201).json(addRole);
        } else {
            res.status(201).json(roleId);
        }
    }
}

exports.updateRole = async (req, res, next) => {
    const id = req.params.id;
    const { roleName, description } = req.body;
    let userId = req.userData.id;
    let updateRole = await models.role.updateRole(roleName, description, userId, id);
    if (updateRole == 0) {
        res.status(404).json({ message: "failed to update role" });
    } else {
        res.status(200).json(updateRole);
    }
}

exports.readAllRole = async (req, res, next) => {
    let readRoleData = await models.role.getAllRole();
    if (!readRoleData) {
        return res.status(404).json({ message: "Data not found" });
    }
    return res.status(200).json( readRoleData );
}


exports.readRolesPagination = async (req, res, next) => {
    const { search, offset, pageSize } = paginationFUNC.paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );
    const searchQuery = {
        [Op.or]:
        {
            roleName: { [Op.iLike]: search + "%" }
        },
        isActive: true,
    };
    let readRoleData = await models.role.findAll({
        where: searchQuery,
        order: [["id", "DESC"]],
        offset: offset,
        limit: pageSize,
    });

    let count = await models.role.findAll({
        where: searchQuery,
        order: [["id", "DESC"]],
    });
    if (!readRoleData) {
        return res.status(404).json({ message: "data not found" });
    }
    return res.status(200).json({ data: readRoleData, count: count.length });
};

exports.deactiveRole = async (req, res, next) => {
    const { stageId, isActive } = req.query;
    let deactiveRole = await models.stage.update({ isActive: isActive }, { where: { id: stageId } })
    if (deactiveRole[0] == 0) { return res.status(404).json({ message: "update failed" }) };
    return res.status(200).json({ message: `Updated` })

}



