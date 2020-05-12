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
    let readGoldRate=await models.goldRate.findAll({attributes:['goldRate']})
    if(!readGoldRate[0])
    {
        res.status(404).json({message:'Data not found'});
    }
    else{
        res.status(200).json(readGoldRate);
    }
}

exports.readPersonalDetailsOfCustomer=async (req,res,next)=>{
    let customerId=req.userData.id;
    let readPersonalDetailsOfCustomer=await models.customer.findOne({attributes:['firstName','lastName','email','panCardNumber','mobileNumber']},{where:{id:customerId}});
    if(!readPersonalDetailsOfCustomer)
    {
        res.status(404).json({message:'Data not found'})
    }
    else{
        res.status(200).json(readPersonalDetailsOfCustomer);
    }

}

exports.readBankDetailsOfCustomer= async(req,res,next)=>{
    let customerId=req.userData.id;
    let readBankDetailsOfCustomer=await models.customerKycBankDetail.findOne({attributes:['bankName','bankBranchName','accountHolderName','accountNumber','ifscCode']},{where:{id:customerId}});
    if(!readBankDetailsOfCustomer)
    {
        res.status(404).json({message:'Data not found'})
    }
    else{
        res.status(200).json(readBankDetailsOfCustomer);
    }

}

exports.readNomineeDetailsOfCustomer=async (req,res,next)=>{
    let customerId=req.userData.id;
    let readNomineeDetailsOfCustomer=await models.customerLoanNomineeDetail.findOne({attributes:['nomineeName','nomineeAge','relationShip']},{where:{id:customerId}});
    if(!readNomineeDetailsOfCustomer)
    {
        res.status(404).json({message:'Data not found'})
    }
    else{
        res.status(200).json(readNomineeDetailsOfCustomer);
    }
}
exports.readAddressDetailsOfCustomer=async(req,res,next)=>{
    let customerId=req.userData.id;
    let readAddressDetailsOfCustomer=await models.customerKycAddressDetail.findOne({attributes:['address']},{where:{id:customerId}});
    if(!readAddressDetailsOfCustomer)
    {
        res.status(404).json({message:'Data not found'})
    }
    else{
        res.status(200).json(readAddressDetailsOfCustomer);
    }
}

exports.readPanCardImageOfCustomer=async(req,res,next)=>{
    let customerId=req.userData.id;
    let readPanCardImageOfCustomer=await models.customerKycPersonalDetail.findOne({attributes:['identityProof']},{where:{id:customerId}});
    if(!readPanCardImageOfCustomer){
        res.status(404).json({message:'Data not found'});
    }
    else{
res.status(200).json(readPanCardImageOfCustomer);
    }
}

exports.readAddressImageOfCustomer=async(req,res,next)=>{
    let customerId=req.userData.id;
    let readAddressImageOfCustomer=await models.customerKycAddressDetail.findOne({attributes:['addressProof']},{where:{id:customerId}});
    if(!readAddressImageOfCustomer){
        res.status(404).json({message:'Data not found'});
    }
    else{
        res.status(200).json(readAddressImageOfCustomer);
    }
}

