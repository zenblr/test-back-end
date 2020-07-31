const csv = require("csvtojson");
const models = require("../../models");
const sequelize = models.sequelize;
const _ = require('lodash')
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');

// upload packet csv
exports.uploadPacket = async (req, res, next) => {
    console.log(req.file)
    console.log(req.file.path)
    const csvFilePath = req.file.path;
    const internalUserBranchId = req.body.internalUserBranch.split(',');
    const jsonArray = await csv().fromFile(csvFilePath);
    if (jsonArray.length == 0) { return res.status(400).json({ message: `Your file is empty.` }) }

    for (var i = 0; i < jsonArray.length; i++) {
        if (check.isEmpty(jsonArray[i].packetUniqueId)) {
            return res.status(400).json({ message: `Packet name is required` })
        }
        if (check.isEmpty(jsonArray[i].barcodeNumber)) {
            return res.status(400).json({ message: `Barcode Number  is required` })
        }
    }


    let packets = await jsonArray.map(value => { return value.packetUniqueId.toLowerCase() })
    var repeatpacketUniqueId = _.filter(packetUniqueId, (val, i, iteratee) => _.includes(iteratee, val, i + 1));
    if (repeatpacketUniqueId.length > 0) {
        return res.status(400).json({ message: `In your csv file there packetUniqueId is duplicate` })
    }
    let barcode = await jsonArray.map(value => { return value.barcodeNumber.toLowerCase() })
    var repeatbarcodeNumber = _.filter(packetUniqueId, (val, i, iteratee) => _.includes(iteratee, val, i + 1));
    if (repeatbarcodeNumber.length > 0) {
        return res.status(400).json({ message: `In your csv file there barcodeNumber is duplicate` })
    }

    var contain = await models.packet.findAll({
        where: { packetUniqueId: { [Op.in]: packets } },//barcodeNumber: { [Op.in]: barcode }
    })

    if (contain.length > 0) {
        let existpacketUniqueId = await contain.map(value => { return value.packetUniqueId })

        return res.status(400).json({ message: `${existpacketUniqueId} packet Id is already exist` })
    }

    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let packetAdded = await models.packet.addPacket(
        packetUniqueId, createdBy, modifiedBy, internalUserBranch, barcodeNumber);
    res.status(201).json({ message: 'you added packet successfully' }, packetAdded);
}
