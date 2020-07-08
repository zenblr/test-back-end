const models = require('../../models'); // importing models.



// Add & Update banner
exports.addUpdateBanner = async (req, res, next) => {
    const { images } = req.body;
    let userId = req.userData.id
    let banner = await models.banner.readBanner()
    if (banner.length == 0) {

        let CreatedBanner = await models.banner.addBanner(images, userId);

        if (!CreatedBanner) {
            res.status(422).json({ message: 'Banner not added' });
        } else {
            res.status(201).json(CreatedBanner)
        }
    } else {
        let id = banner[0].id;
        let UpdateData = await models.banner.update(id, images, userId)

        if (UpdateData[0] === 0) {
            return res.status(404).json({ message: 'Data not updated' });
        }
        return res.status(200).json({ message: 'Success' });

    }
}

// Read Banner.

exports.readBanner = async (req, res, next) => {
    let banner = await models.banner.findAll({
        // include: {
        //     model: models.bannerImages,
        //     as: 'bannerImage',
        //     include: {
        //         model: models.fileUpload,
        //         as: 'bannerImage'
        //     }
        // }
    })
    // const id = banner[0].id;
    // return res.json(banner[0])
    // let bannerData = await models.banner.findOne({ where: { id } });
    if (!banner) {
        res.status(404).json({ message: 'Data not found' });
    } else {
        res.status(200).json(banner[0]);
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