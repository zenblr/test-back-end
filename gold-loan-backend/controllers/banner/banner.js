const models = require('../../models'); // importing models.



// Add & Update banner
exports.addUpdateBanner = async (req, res, next) => {
    const { images } = req.body;
    let userId = req.userData.id
    let banner = await models.banner.findAll()
    if (banner.length == 0) {
        let CreatedBanner = await models.banner.create({images, userId});
        if (!CreatedBanner) {
            res.status(422).json({ message: 'Banner not added' });
        } else {
            res.status(201).json(CreatedBanner)
        }
    } else {
        let id = banner[0].id;
        let UpdateData = await models.banner.update({ images, userId }, { where: { id } })
        if (UpdateData[0] === 0) {
            res.status(404).json({ message: 'Data not updated' });
        } else {
            res.status(200).json({ message: 'Success' });
        }
    }
}

// Read Banner.

exports.readBanner = async (req, res, next) => {
    let banner = await models.banner.findAll()
    const id = banner[0].id;
    let bannerData = await models.banner.readBanner(id);
    if (!bannerData) {
        res.status(404).json({ message: 'Data not found' });
    } else {
        res.status(200).json(bannerData);
    }
};

// //Delete Banner.

// exports.deleteBanner = async (req, res, next) => {
//     let bannerId = req.params.id;

//     let bannerData = await models.banner.findOne({ where: { id: bannerId } });
//     if (!bannerData[0]) {
//         return res.status(404).json({ message: ' data not found' })
//     }
//     let deletedata = await models.banner.destroy({ where: { id: bannerId } });
//     res.status(200).json({ message: 'Success' });
// }