const models = require('../../models');

// add karat details
exports.addKaratDetails = async (req, res) => {
    const { karat, fromPercentage, toPercentage, range } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    if (toPercentage < fromPercentage) {
        return res.status(400).json({ message: 'from percentage should less than to percentage' })
    }
    let addKaratDetails = await models.karatDetails.create({ karat, fromPercentage, toPercentage, range, createdBy, modifiedBy })
    if (!addKaratDetails) {
        return res.status(422).json({ message: 'karat details is not created ' })
    }
    return res.status(201).json({ message: 'karat details is created' });
}

// read karat details
exports.readKaratDetails = async (req, res) => {
    let readKaratDetails = await models.karatDetails.findAll({
        where: { isActive: true },
        order: [["karat", "ASC"]],
        include: [
            {
                model: models.user,
                as: "Createdby",
            },
            {
                model: models.user,
                as: "Modifiedby",
            },]
    });

    // if(!readKaratDetails){
    //     return res.status(200).json({message:'data not found'})
    // }
    return res.status(200).json({ message: 'message', data: readKaratDetails });
}
exports.readKaratDetailsById = async (req, res) => {
    let karatDetailsId = req.params.id;
    let readKaratDetailsById = await models.karatDetails.findOne({ where: { id: karatDetailsId, isActive: true } });
    if (!readKaratDetailsById) {
        return res.status(404).json({ message: 'data not found' });
    }

    // for(var i=0;i<readKaratDetails.length;i++){
    //     for(var index=readKaratDetails[i].fromPercentage;i<readKaratDetails[i].toPercentage;readKaratDetails[i].fromPercentage++)
    // range.push(index);
    // }
    // console.log(range);
    // console.log(readKaratDetailsById);
    // for(i=readKaratDetailsById.dataValues.fromPercentage;i<readKaratDetailsById.toPercentage;i++){
    //     range.push(i);
    // }

    res.status(200).json({ data: { readKaratDetailsById } });
}

// update karat details

exports.updateKaratDetails = async (req, res) => {
    let karatDetailsId = req.params.id;
    const { karat, fromPercentage, toPercentage } = req.body;
    let modifiedBy = req.userData.id;
    if (fromPercentage >= toPercentage) {
        return res.status(400).json({ message: 'from percentage should less than to percentage' })
    }
    let updateKaratDetails = await models.karatDetails.update({ karat, fromPercentage, toPercentage, modifiedBy }, { where: { id: karatDetailsId, isActive: true } });
    if (!updateKaratDetails[0]) {
        return res.status(404).json({ message: 'karat details  update failed' });
    }
    return res.status(200).json({ message: 'updated' })
}

// deactive karat details

exports.deactiveKaratdetails = async (req, res) => {
    const { id } = req.query;
    let deactiveKaratdetails = await models.karatDetails.update({ isActive: false }, { where: { id, isActive: true } });
    if (!deactiveKaratdetails[0]) {
        return res.status(404).json({ message: 'deleted failed' });
    }
    return res.status(200).json({ message: 'updated' })
}
