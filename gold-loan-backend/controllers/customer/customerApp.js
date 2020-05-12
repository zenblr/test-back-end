const models = require('../../models'); // importing models.


exports.readBanner = async (req, res, next) => {
    console.log("banner")
    let banner = await models.banner.readBanner()
    if (!banner) {
        res.status(404).json({ message: 'Data not found' });
    } else {
        res.status(200).json(banner[0]);
    }
};


exports.readOffer = async (req, res, next) => {
    let offer = await models.offer.readOffer()
    if (!offer[0]) {
        res.status(400).json({ message: 'Data not found' });
    } else {
        res.status(200).json(offer[0]);
    }
};


exports.readLenderBanner = async (req, res, next) => {
    let lenderBanner = await models.lenderBanner.readLenderBanner()
    if (!lenderBanner[0]) {
        res.status(404).json({ message: 'Data not found' });
    } else {
        res.status(200).json(lenderBanner[0]);
    }
};

exports.readGoldRate=async (req,res,next)=>{
    let readGoldRate=await models.goldRate.finAll({where:{isActive:true}})
    if(!readGoldRate[0])
    {
        res.status(404).json({message:'Data not found'});
    }
    else{
        res.status(200).json(readGoldRate);
    }
}

exports.personalDetailsOfCustomer=async (req,res,next)=>{
    let readPersonalDetailsOfCustomer=await models.customerKyc.finAll({isActive:true});
    if(!readPersonalDetailsOfCustomer[0])
    {
        res.status(404).json({message:'Data not found'})
    }
    else{
        res.status(200).json(readPersonalDetailsOfCustomer);
    }
}

