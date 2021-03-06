const models = require('../../models'); // importing models.



// Add & Update offer
exports.addUpdateOffer = async (req, res, next) => {
    const { images } = req.body;

    let userId = req.userData.id
    let offer = await models.offer.readOffer()
    if (offer.length == 0) {
        let CreatedOffer = await models.offer.addOffer(images, userId);

        if (!CreatedOffer) {
            res.status(400).json({ message: 'Offer not added' });
        } else {
            res.status(200).json({ message: 'Offer Created' })
        }
    } else {
        let id = offer[0].id;
        let UpdateData = await models.offer.updateOffer(id, images, userId);

        if (UpdateData[0] === 0) {
            return res.status(404).json({ message: 'Data not updated' });
        }
        return res.status(200).json({ message: 'Success' });
    }
}

// Read Offer.

exports.readOffer = async (req, res, next) => {
    let offer = await models.offer.findAll({
        // include: {
        //     model: models.offerImages,
        //     as: 'offerImages',
        //     include: {
        //         model: models.fileUpload,
        //         as: 'offerImages'
        //     }
        // }
    })
    if (!offer[0]) {
        res.status(400).json({ message: 'Data not found' });
    } else {
        res.status(200).json(offer[0]);
    }

};

