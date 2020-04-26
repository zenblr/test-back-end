const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const request = require("request");
const { createReferenceCode } = require("../../utils/referenceCode");
const CONSTANT = require("../../utils/constant");
const moment = require("moment");

const check = require("../../lib/checkLib");

exports.addAppraisalRating = async (req, res, next) => {

    // let { customerId, customerKycId, behaviourRatingAppraisal, idProofRatingAppraisal, addressProofRatingAppraisal, kycStatusFromAppraisal } = req.body;

    // let appraisalId = req.userData.id
    // let checkRatingExist = await models.customerKycClassification.findOne({ where: { customerId } })
    // if (!check.isEmpty(checkRatingExist)) {
    //     return res.status(200).json({ message: `This customer rating is already exist` })
    // }

    // await sequelize.transaction(async (t) => {
    //     await models.customer.update(
    //         { isVerifiedByFirstStage: true, firstStageVerifiedBy: appraisalId, kycStatus:"confirm"  },
    //         { where: { id: customerId } })

    //     await models.customerKycPersonalDetail.update(
    //         { isVerifiedByFirstStage: true, firstStageVerifiedBy: appraisalId,  kycStatus:"confirm"   },
    //         { where: { id: customerKycId } })

    //     await models.customerKycClassification.create({ customerId, customerKycId, behaviourRatingAppraisal, idProofRatingAppraisal, addressProofRatingAppraisal, kycStatusFromAppraisal, appraisalId })
    // });

    // if (!check.isEmpty(giveRating)) {
    //     return res.status(200).json({ message: `Something went wrong while give rating.` })
    // }

    // return res.status(200).json({ message: 'success' })
}