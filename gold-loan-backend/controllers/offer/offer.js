const models = require('../../models'); // importing models.



// Add & Update offer
exports.addUpdateOffer = async (req, res, next) => {
    const { images } = req.body;
    let userId = req.userData.id
    let offer = await models.offer.findAll()
    if (offer.length == 0) {
        let CreatedOffer = await models.offer.create({ images, userId });
        if (!CreatedOffer) {
            res.status(422).json({ message: 'Offer not added' });
        } else {
            res.status(201).json(CreatedOffer)
        }
    } else {
        let id = offer[0].id;
        let UpdateData = await models.offer.update({ images, userId }, { where: { id } })
        if (UpdateData[0] === 0) {
            return res.status(404).json({ message: 'Data not updated' });
        }
        return res.status(200).json({ message: 'Success' });

    }
}

// Read Offer.

exports.readOffer = async (req, res, next) => {
    let offer = await models.offer.findAll()
    if (!offer[0]) {
        res.status(404).json({ message: 'Data not found' });
    } else {
        res.status(200).json(offer[0]);
    }
};
