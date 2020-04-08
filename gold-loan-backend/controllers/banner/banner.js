const models = require('../../models'); // importing models.



// Add & Update banner
exports.addUpdateBanner = async(req, res, next) => {
    const id = 1;
    const { images, userId } = req.body;
    let BannerData = await models.banner.findBanner(id);
    if (!BannerData) {
        // If id not found create new entry
        let CreatedBanner = await models.banner.addBanner(images, userId);
        if (!CreatedBanner) {
            res.status(422).json({ message: 'Banner not added' });
        } else {
            res.status(201).json(CreatedBanner)
        }
    } else {
        // if category found update images in arrays
        let UpdateData = await models.banner.updateBanner(id, images, userId)
        if (UpdateData[0] === 0) {
            res.status(404).json({ message: 'Data not updated' });
        } else {
            res.status(200).json({ message: 'Success' });
        }
    }
}

// Read Banner.

exports.readBanner = async(req, res, next) => {
    const id = 1;
    let bannerData = await models.banner.readBanner(id);
    if (!bannerData) {
        res.status(404).json({ message: 'Data not found' });
    } else {
        res.status(200).json(bannerData);
    }
};

//Delete Banner.

exports.deleteBanner = async(req, res, next) => {
    let bannerId = req.params.id;

    let bannerData = await models.banner.findOne({ where: { id:bannerId } });
    if (!bannerData[0]) {
        return res.status(404).json({ message: ' data not found' })
    }
    let deletedata = await models.banner.destroy({ where: { id:bannerId } });
    res.status(200).json({ message: 'Success' });
}