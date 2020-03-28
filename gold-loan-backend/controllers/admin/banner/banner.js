const models = require('../../../models'); // importing models.



// Add & Update banner
exports.AddUpdateBanner = async(req, res) => {
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

exports.ReadBanner = async(req, res) => {
    const id = 1;
    let BannerData = await models.banner.readBanner(id);
    if (!BannerData) {
        res.status(404).json({ message: 'Data not found' });
    } else {
        res.status(200).json(BannerData);
    }
};

//Delete Banner.

exports.DeleteBanner = async(req, res) => {
    let id = req.params.id;

    let data = await models.banner.findOne({ where: { id } });
    if (!data) {
        return res.status(404).json({ message: ' data not found' })
    }
    let deletedata = await models.banner.destroy({ where: { id } });
    res.status(200).json({ message: 'Sucess' });
}