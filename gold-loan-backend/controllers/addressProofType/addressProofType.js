const models = require('../../models');
const check = require('../../lib/checkLib');


// Add Address Proof Type
exports.addAddressProofType = async (req, res) => {
    const { name } = req.body;
    let addressProofTypeExist = await models.addressProofType.findOne({ where: { name, isActive: true } })
    if (!check.isEmpty(addressProofTypeExist)) {
        return res.status(404).json({ message: 'This Addres Proof Type is already Exist' });
    }
    const data = await models.addressProofType.create({ name });
    if (!data) {
        return res.status(422).json({ message: 'Address Proof Type is not created' });
    }
    return res.status(201).json({ message: 'Address Proof Type is created' });
}

// get Address Proof Type

exports.readAddressProofType = async (req, res) => {

    const readAddressProofType = await models.addressProofType.findAll({ where: { isActive: true } });

    if (!readAddressProofType[0]) {
        return res.status(404).json({ message: 'Data not found' });
    }
    return res.status(200).json({message:'Success',data: readAddressProofType});
}

//deactive Address Proof type

exports.deactivateAddressProofType = async (req, res, next) => {
    const { id, isActive } = req.query;
    const deactiveAddressProofType = await models.addressProofType.update({ isActive: isActive }, { where: { id: id } })
    if (!deactiveAddressProofType[0] ) {
        return res.status(404).json({ message: "Address Proof Type deleted failed" });
    }
    return res.status(200).json({ message: `Updated` })
}