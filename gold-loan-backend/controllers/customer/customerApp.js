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

exports.readGoldRate = async (req, res, next) => {
    let readGoldRate = await models.goldRate.findAll({ attributes: ['goldRate'] })
    if (!readGoldRate[0]) {
        res.status(404).json({ message: 'Data not found' });
    }
    else {
        res.status(200).json(readGoldRate);
    }
}

exports.readPersonalDetailsOfCustomer = async (req, res, next) => {
    let customerId = req.userData.id;
    let readPersonalDetailsOfCustomer = await models.customer.findOne({ attributes: ['firstName', 'lastName', 'email', 'panCardNumber', 'mobileNumber'] }, { where: { customerId: customerId } });
    if (!readPersonalDetailsOfCustomer) {
        res.status(404).json({ message: 'Data not found' })
    }
    else {
        res.status(200).json(readPersonalDetailsOfCustomer);
    }

}

exports.readBankDetailsOfCustomer = async (req, res, next) => {
    let customerId = req.userData.id;
    let readBankDetailsOfCustomer = await models.customerKycBankDetail.findOne({ attributes: ['bankName', 'bankBranchName', 'accountHolderName', 'accountNumber', 'ifscCode'] }, { where: { customerId: customerId } });
    if (!readBankDetailsOfCustomer) {
        res.status(404).json({ message: 'Data not found' })
    }
    else {
        res.status(200).json(readBankDetailsOfCustomer);
    }

}

exports.readNomineeDetailsOfCustomer = async (req, res, next) => {
    let customerId = req.userData.id;
    let readNomineeDetailsOfCustomer = await models.customerLoanNomineeDetail.findAll({attributes:['nomineeName','nomineeAge','relationship']},{ where: customerId });
    if (!readNomineeDetailsOfCustomer) {
        res.status(404).json({ message: 'Data not found' })
    }
    else {
        res.status(200).json(readNomineeDetailsOfCustomer);
    }
}
exports.readAddressDetailsOfCustomer = async (req, res, next) => {
    let customerId = req.userData.id;
    let readAddressDetailsOfCustomer = await models.customerKycAddressDetail.findAll({ attributes:['address','stateId','cityId','pinCode'] }, { where: { customerId: customerId } });
    if (!readAddressDetailsOfCustomer) {
        res.status(404).json({ message: 'Data not found' })
    }
    else {
        res.status(200).json(readAddressDetailsOfCustomer);
    }
}

exports.readPanCardImageOfCustomer = async (req, res, next) => {
    let customerId = req.userData.id;
    let readPanCardImageOfCustomer = await models.customerKycPersonalDetail.findOne({ attributes: ['identityProof'] }, { where: { customerId: customerId } });
    if (!readPanCardImageOfCustomer) {
        res.status(404).json({ message: 'Data not found' });
    }
    else {
        res.status(200).json(readPanCardImageOfCustomer);
    }
}

exports.readAddressImageOfCustomer = async (req, res, next) => {
    let customerId = req.userData.id;
    let readAddressImageOfCustomer = await models.customerKycAddressDetail.findOne({ attributes: ['addressProof'] }, { where: { customerId: customerId } });
    if (!readAddressImageOfCustomer) {
        res.status(404).json({ message: 'Data not found' });
    }
    else {
        res.status(200).json(readAddressImageOfCustomer);
    }
}

exports.readPartnerBranch = async (req, res, next) => {
    let id = req.params.id;
    console.log(id)
    let readPartner = await models.partnerBranch.findAll(
        {
            where: { cityId: id },
            attributes: ['id', 'name', 'address', 'cityId'],
            include: [{
                model: models.city,
                as: 'city'
            },

            {
                model: models.partner,
                as: "partner"
            }]

        });
    if (!readPartner[0]) {
        res.status(404).json({ message: 'Data not found' })
    }
    else {
        res.status(200).json(readPartner);
    }
}
exports.readMyLoan = async (req, res, next) => {
    let customerId = req.userData.id;
    let readMyLoan = await models.customerFinalLoan.findOne({ attributes: ['loanId','interestRate','tenure','loanStartDate','loanEndDate','finalLoanAmount'] }, { where: { customerId: customerId } });
    if (!readMyLoan) {
        res.status(404).json({ message: 'Data not found' })
    }
    else {
        res.status(200).json(readMyLoan);
    }
}

exports.readAllScheme = async (req, res, next) => {
    let getAllScheme = await models.scheme.findAll({ where: { isActive: true } });
    if (!getAllScheme[0]) {
        res.status(404).json({ message: 'Data not found' })
    }
    else {
        res.status(200).json(getAllScheme)
    }
}

exports.readLoanDetails = async (req, res, next) => {
    let customerId = req.userData.id;
    let loanDetails = await models.customerFinalLoan.findOne({attributes:['loanId','finalLoanAmount','interestRate',
    'tenure','loanStartDate','loanEndDate']},{ where: { isActive: true, customerId: customerId } });
    if (!loanDetails) {
        res.status(404).json({message:'Data not found'})
    }
    else{
        res.status(200).json(loanDetails)
    }
}

exports.schemeBasedOnPriceRange=async(req,res,next)=>{
    const{schemeAmountStart,schemeAmountEnd}=req.query;
    const query={};

    query.isActive=true;
    
    if(schemeAmountEnd && schemeAmountEnd){
        query.schemeAmountStart=schemeAmountStart;
        query.schemeAmountEnd=schemeAmountEnd
    }
    let schemeBasedOnPriceRange=await models.scheme.findAll({
        where: query});
    if (!schemeBasedOnPriceRange[0]) {
      return  res.status(404).json({message:'Data not found'})
    }
    else{
     return   res.status(200).json(schemeBasedOnPriceRange);
    }
}

exports.readFeedBack=async(req,res)=>{
    let readCustomerFeedBack=await models.feedBack.findAll({attributes:['customerName','feedBack','rating','profileImage']},{where:{isActive:true}});
        //     include: [
        // {
        //     model:models.customer,
        //     as: "customer",
        //     attributes:['firstName',"lastName"]
        // }
    // ], });

    if(!readCustomerFeedBack[0]){
        return res.status(404).json({message:'data not found'});
    
    }
    return res.status(200).json(readCustomerFeedBack);
        
    }