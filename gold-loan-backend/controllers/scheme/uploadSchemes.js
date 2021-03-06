const csv = require("csvtojson");
const models = require("../../models");
const sequelize = models.sequelize;
const _ = require('lodash')
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');
const multer = require('multer');
const multerS3 = require('multer-s3');
let AWS = require('aws-sdk');

// upload scheme csv
exports.uploadScheme = async (req, res, next) => {

    const csvFilePath = req.file.path;
    const partnerId = req.body.partnerId.split(',');
    const jsonArray = await csv().fromFile(csvFilePath);
    if (jsonArray.length == 0) { return res.status(400).json({ message: `Your file is empty.` }) }
    for (var i = 0; i < jsonArray.length; i++) {
        if (jsonArray[i].AmountStart >= jsonArray[i].AmountEnd) {
            return res.status(400).json({ message: `Your Scheme start amount is must be greater than your Scheme end amount` })
        }
        if (check.isEmpty(jsonArray[i].schemeName)) {
            return res.status(400).json({ message: `Scheme name is required` })
        }
        if (check.isEmpty(jsonArray[i].schemeType)) {
            return res.status(400).json({ message: `Scheme type is required` })
        }

        if (!check.isNumeric(parseFloat(jsonArray[i].processingChargePer)) && parseFloat(jsonArray[i].processingChargePer) < 100) {
            return res.status(400).json({ message: `Processing Charge in percentage is not valid` })
        }
        if (!check.isNumeric(parseFloat(jsonArray[i].processingChargeAmt))) {
            return res.status(400).json({ message: `Processing Charge in amount is not valid` })
        }
        if (!check.isNumeric(parseFloat(jsonArray[i].maximumPerAllow)) && parseFloat(jsonArray[i].maximumPerAllow) < 100) {
            return res.status(400).json({ message: `maximum percentage amount is not valid` })
        }
        if (!check.isNumeric(parseFloat(jsonArray[i].penalInterest)) && parseFloat(jsonArray[i].penalInterest) < 100) {
            return res.status(400).json({ message: `penal interest  is not valid` })
        }
        if (!check.isNumeric(parseFloat(jsonArray[i].InterestRateThirtyDaysMonthly)) && parseFloat(jsonArray[i].InterestRateThirtyDaysMonthly) < 100) {
            return res.status(400).json({ message: `interest rate thirty days monthly is not valid` })
        }
        if (!check.isNumeric(parseFloat(jsonArray[i].InterestRateNinetyDaysMonthly)) && parseFloat(jsonArray[i].InterestRateNinetyDaysMonthly) < 100) {
            return res.status(400).json({ message: `interest rate ninety days monthly is not valid` })
        }
        if (!check.isNumeric(parseFloat(jsonArray[i].InterestRateOneHundredEightyDaysMonthly)) && parseFloat(jsonArray[i].InterestRateOneHundredEightyDaysMonthly) < 100) {
            return res.status(400).json({ message: `interest rate onehundredeighty days monthly is not valid` })
        }

    }

    let scheme = await jsonArray.map(value => { return value.schemeName.toLowerCase() })
    var repeatSchemeName = _.filter(scheme, (val, i, iteratee) => _.includes(iteratee, val, i + 1));
    if (repeatSchemeName.length > 0) {
        return res.status(400).json({ message: `In your csv file there scheme name is dublicate` })
    }
    let defaultset = await jsonArray.map(value => { return value.default === "TRUE" ? true : false });
    let schemeDefault = await defaultset.filter(x => { return x === true; });
    if (schemeDefault.length > 1) {
        return res.status(400).json({ message: `more then one default value is true` })
    }


    var contain = await models.scheme.findAll({
        where: { schemeName: { [Op.in]: scheme } },
        include: [{
            model: models.partner,
            where: { id: partnerId[0] }
        }]
    })
    if (contain.length > 0) {
        let existSchemeName = await contain.map(value => { return value.schemeName })

        return res.status(400).json({ message: `${existSchemeName} this scheme is already exist` })
    }


    await sequelize.transaction(async t => {

        if (schemeDefault.length == 1) {
            let readSchemeByPartner = await models.partner.findOne({
                where: { isActive: true, id: partnerId[0] },
                include: [{
                    model: models.scheme,
                    where: { isActive: true }
                }],
            });
            if (readSchemeByPartner) {
                let schemeArray = [];
                for (let scheme of readSchemeByPartner.schemes) {
                    schemeArray.push(scheme.id);
                }
                await models.scheme.update({ default: false }, { where: { id: { [Op.in]: schemeArray } }, transaction: t });
            }
        }

        for (var i = 0; i < jsonArray.length; i++) {

            let addSchemeData = await models.scheme.create({
                isSplitAtBeginning: jsonArray[i].isSplitAtBeginning,
                schemeName: jsonArray[i].schemeName.toLowerCase(), schemeType: jsonArray[i].schemeType, default: jsonArray[i].default,
                processingChargePercent: parseFloat(jsonArray[i].processingChargePer), processingChargeFixed: parseFloat(jsonArray[i].processingChargeAmt),
                // maximumPercentageAllowed: parseFloat(jsonArray[i].maximumPerAllow), penalInterest: parseFloat(jsonArray[i].penalInterest),

                schemeAmountStart: jsonArray[i].AmountStart, schemeAmountEnd: jsonArray[i].AmountEnd,
                interestRateThirtyDaysMonthly: jsonArray[i].InterestRateThirtyDaysMonthly, interestRateNinetyDaysMonthly: jsonArray[i].InterestRateNinetyDaysMonthly,
                interestRateOneHundredEightyDaysMonthly: jsonArray[i].InterestRateOneHundredEightyDaysMonthly
            }, { transaction: t });

            let schemedata = await models.partnerScheme.create({
                schemeId: addSchemeData.id,
                partnerId: partnerId

            }, { transaction: t })
        }

    })

    // let readSchemeByPartner = await models.partner.findOne({
    //     where: { isActive: true, id: partnerId[0] },
    //     include: [{
    //     model: models.scheme,
    //     where: { isActive: true }
    //     }],
    //     });
    //     let schemeArray = [];
    //     for(let scheme of readSchemeByPartner.schemes){
    //     schemeArray.push(scheme.id);
    //     }
    //     await models.scheme.update(
    //     { default: false }, { where: { id:{[Op.in]: schemeArray } } });

    return res.status(200).json({ message: " Schemes Created" })

}


exports.bulkUploadExcelFile = async (req, res, next) => {
    let destination = 'public/uploads/bulkUpload/'
        const storage = multer.diskStorage({
            filename: (req, file, cb) => {
                const extArray = file.originalname.split(".");
                const extension = extArray[extArray.length - 1];
                cb(null, `${Date.now()}.${extension}`);
            },
            destination: destination
        });
        
        const uploads = multer({
            storage
        }).single("avatar");
        uploads(req, res, async err => {
            if (err) {
                res.status(500);
            }
            let pathToadd = destination.replace('public/', '');
            req.file.userId = req.userData.id;
            req.file.path = pathToadd + req.file.filename;
            req.file.url = req.file.destination + req.file.filename;

            console.log(req.file);
            let uploadFile = await models.fileUpload.create(req.file);
            if (!uploadFile) {
                res.status(400).json({
                    message: "Error while uploading file!"
                });
            } else {
                res.status(200).json({
                    uploadFile
                });
            }
        });
};
