const csv = require("csvtojson");
const models = require("../../models");
const sequelize = models.sequelize;
const _ = require('lodash')
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');
const fs = require("fs");

// upload packet csv
exports.uploadPacket = async (req, res, next) => {
    console.log(req.file)

    const csvFilePath = req.file.path;
    //console.log(req.body.internalUserBranch)
    console.log(req.body)
    const { internalUserBranch } = req.body;
    const jsonArray = await csv().fromFile(csvFilePath);
    console.log(jsonArray)
    if (jsonArray.length == 0) { return res.status(400).json({ message: `Your file is empty.` }) }

    for (var i = 0; i < jsonArray.length; i++) {
        if (check.isEmpty(jsonArray[i].packetUniqueId)) {
            return res.status(400).json({ message: `Packet ID is required` })
        }
        if (check.isEmpty(jsonArray[i].barcodeNumber)) {
            return res.status(400).json({ message: `Barcode Number  is required` })
        }
    }


    let packets = await jsonArray.map(value => { return value.packetUniqueId })
    var repeatpacketUniqueId = _.filter(packets, (val, i, iteratee) => _.includes(iteratee, val, i + 1));
    if (repeatpacketUniqueId.length > 0) {
        return res.status(400).json({ message: `In your csv file packetUniqueId is duplicate` })
    }
    let barcode = await jsonArray.map(value => { return value.barcodeNumber })
    var repeatbarcodeNumber = _.filter(barcode, (val, i, iteratee) => _.includes(iteratee, val, i + 1));
    if (repeatbarcodeNumber.length > 0) {
        return res.status(400).json({ message: `In your csv file barcodeNumber is duplicate` })
    }

    var contain = await models.packet.findAll({
        where: { packetUniqueId: { [Op.in]: packets }, }
    })

    if (contain.length > 0) {
        let existpacketUniqueId = await contain.map(value => { return value.packetUniqueId })
        return res.status(400).json({ message: `Following packets are already exists "${existpacketUniqueId}".` })
    }

    var containBarcode = await models.packet.findAll({
        where: { barcodeNumber: { [Op.in]: barcode } }

    })



    if (containBarcode.length > 0) {
        let existbarcodeNumber = await containBarcode.map(value => { return value.barcodeNumber })
        return res.status(400).json({ message: `Following packets are already exists "${existbarcodeNumber}"` })
    }

    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    filename = req.file.originalname;

    for (var i = 0; i < jsonArray.length; i++) {
        await models.packet.create({
            createdBy,
            modifiedBy,
            packetAssigned: false,
            isActive: true,
            internalUserBranch: internalUserBranch,
            packetUniqueId: jsonArray[i].packetUniqueId,
            barcodeNumber: jsonArray[i].barcodeNumber

        })
    }
    res.status(201).json({ message: 'you added packet successfully', filename });

}
