const models = require('../../models');
const check = require('../../lib/checkLib');


// Add Identity Type
exports.addIdentityType = async (req, res) => {
    const { name } = req.body;
    let identityTypeExist = await models.identityType.findOne({ where: { name, isActive: true } })
    if (!check.isEmpty(identityTypeExist)) {
        return res.status(400).json({ message: 'This Identity Type  is already Exist' });
    }
    const addIdentityType = await models.identityType.create({ name });
    if (!addIdentityType) {
        return res.status(422).json({ message: 'Identity Type is not created' });
    }
    return res.status(201).json({ message: 'Identity Type is created' });
}

// get Identity Type

exports.readIdentityType = async (req, res) => {

    const readIdentityType = await models.identityType.findAll({ where: { isActive: true } });

    if (!readIdentityType[0]) {
        return res.status(404).json({ message: 'data not found' });
    }
    res.status(200).json({ message: "Success", data: readIdentityType });
}

// update Identity type

exports.updateIdentityType = async (req, res) => {
    let identityTypeId = req.params.id;
    const { name } = req.body;
    let updateIdentityType = await models.identityType.update({ name }, { where: { id: identityTypeId, isActive: true } });
    if (!updateIdentityType[0]) { return res.status(404).json({ message: 'identity type  update failed' }); }
    return res.status(200).json({ message: 'Updated' });
}
//deactive Identity type

exports.deactivateIdentityType = async (req, res, next) => {
    const { id, isActive } = req.query;
    const deactiveIdentityType = await models.identityType.update({ isActive: isActive }, { where: { id: id } })
    if (deactiveIdentityType[0] == 0) {
        return res.status(404).json({ message: "Identity type deleted failed" });
    }
    return res.status(200).json({ message: `Updated` })
}