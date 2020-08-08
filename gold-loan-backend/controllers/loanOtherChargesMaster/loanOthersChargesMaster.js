
const models = require('../../models')
const check = require('../../lib/checkLib');

exports.addOtherCharges = async (req, res, next) => {

    let { description } = req.body;

    let otherCharges = await models.loanOtherChargesMaster.create({ description })
    return res.status(200).json({ message: `Created` })

}
exports.getOtherCharges = async (req, res, next) => {

    let { getAll } = req.query

    if (req.query.from == 1 && req.query.to == -1) {
        let allOtherCharges = await models.loanOtherChargesMaster.findAll();
        return res.status(200).json({ data: allOtherCharges });
    } else {

        let whereCondition;
        if (getAll == "true") {
            whereCondition = { order: [["updatedAt", "DESC"]] }
        } else if (getAll == "false") {
            whereCondition = { order: [["updatedAt", "DESC"]] }
        } else if (getAll == undefined) {
            whereCondition = { order: [["updatedAt", "DESC"]] }
        }
        let allOtherCharges = await models.loanOtherChargesMaster.findAll(whereCondition)
        if (allOtherCharges.length === 0){
            return res.status(200).json([])
        }
            return res.status(200).json({ data: allOtherCharges, count: allOtherCharges.length })
    }

}

exports.updateOtherCharges = async (req, res, next) => {
    let { description } = req.body;
    let { id } = req.params;

    let otherChargesExist = await models.loanOtherChargesMaster.findOne({ where: { description: description } })
    if (!check.isEmpty(otherChargesExist)) {
        return res.status(404).json({ message: 'Other Charges already Exist' });
    }

    let UpdateData = await models.loanOtherChargesMaster.update({ description }, { where: { id: id } })
    if (UpdateData[0] === 0) {
        return res.status(404).json({ message: 'Data not updated' });
    }

    return res.status(200).json({ message: `Succesfully` });
}

exports.deactivateOtherCharges = async (req, res, next) => {
    let { id } = req.params;

    const otherChargesExist = await models.loanOtherChargesMaster.destroy({ where: { id: id } })
    if (otherChargesExist[0] == 0) {
        return res.status(404).json({ message: "Purpose deleted failed" });
    }
    return res.status(200).json({ message: `Updated` })
}