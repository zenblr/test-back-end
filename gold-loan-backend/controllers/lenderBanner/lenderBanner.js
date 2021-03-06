const models = require('../../models'); // importing models.



// Add & Update offer
exports.addUpdateLenderBanner = async (req, res, next) => {
    const { images } = req.body;
    let userId = req.userData.id
    let lenderBanner = await models.lenderBanner.readLenderBanner()
    if (lenderBanner.length == 0) {
        let createdLenderBanner = await models.lenderBanner.addLenderBanner(images, userId);

        if (!createdLenderBanner) {
            res.status(422).json({ message: 'Lender Banner not added' });
        } else {
            res.status(201).json(createdLenderBanner)
        }
    } else {
        let id = lenderBanner[0].id;
        let UpdateData = await models.lenderBanner.updateLenderBanner(id, images, userId);

        if (UpdateData[0] === 0) {
            return res.status(404).json({ message: 'Data not updated' });
        }
        return res.status(200).json({ message: 'Success' });

    }
}

// Read Offer.

exports.readLenderBanner = async (req, res, next) => {
    let lenderBanner = await models.lenderBanner.findAll({
        // include: {
        //     model: models.lenderBannerImages,
        //     as: 'lenderBannerImages',
        //     include: {
        //         model: models.fileUpload,
        //         as: 'lenderBannerImages'
        //     }
        // }
    })
    if (!lenderBanner[0]) {
        res.status(404).json({ message: 'Data not found' });
    } else {
        res.status(200).json(lenderBanner[0]);
    }
};
