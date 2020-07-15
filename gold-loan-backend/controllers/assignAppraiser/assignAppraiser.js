const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const request = require("request");
const { createReferenceCode } = require("../../utils/referenceCode");
const CONSTANT = require("../../utils/constant");
const moment = require("moment");
const check = require("../../lib/checkLib");
const { paginationWithFromTo } = require("../../utils/pagination");


exports.addAssignAppraiser = async (req, res, next) => {

    let { customerUniqueId, appraiserId, customerId, appoinmentDate, startTime, endTime } = req.body;

    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let existAssign = await models.customerAssignAppraiser.findOne({ where: { customerUniqueId } });
    if (!check.isEmpty(existAssign)) {
        return res.status(400).json({ message: `This customer already assign to the appraiser` })
    }

    await models.customerAssignAppraiser.create({ customerId, customerUniqueId, appraiserId, createdBy, modifiedBy, appoinmentDate, startTime, endTime });

    let { mobileNumber } = await models.user.findOne({ where: { id: appraiserId } })

    request(`${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message= customer unique Id ${customerUniqueId} is assign for you`);

    return res.status(200).json({ message: 'success' })
}

exports.editAssignAppraiser = async (req, res, next) => {
    let { id } = req.params;
    let modifiedBy = req.userData.id;

    let { appraiserId, appoinmentDate, startTime, endTime } = req.body;

    let getAssignCustomer = await models.customerAssignAppraiser.findOne({ where: { id: id } })

    await models.customerAssignAppraiser.update({ appraiserId, modifiedBy, appoinmentDate, startTime, endTime }, { where: { id: id } });

    if (getAssignCustomer.appraiserId != appraiserId) {
        let { mobileNumber } = await models.user.findOne({ where: { id: appraiserId } })

        request(`${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message= customer unique Id ${getAssignCustomer.customerUniqueId} is assign for you`);
    }

    return res.status(200).json({ message: 'success' })

}

exports.getSingleAssign = async (req, res) => {

    let { id } = req.params;

    let singleAssign = await models.customerAssignAppraiser.findOne({
        where: { id },
        include: [{
            model: models.user,
            as: "appraiser",
            attributes: ['id', 'firstName', 'lastName']
        }, {
            model: models.customer,
            as: "customer",
            attributes: ['id', 'firstName', 'lastName']
        }]
    })

    return res.status(200).json({ message: 'success', data: singleAssign })

}

exports.getListAssignAppraiser = async (req, res) => {


    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );

    const searchQuery = {
        [Op.or]: {
            "$appraiser.first_name$": {
                [Op.iLike]: search + "%",
            },
            "$appraiser.last_name$": {
                [Op.iLike]: search + "%",
            },
            customer_unique_id: { [Op.iLike]: search + "%" }
        },
    };

    let includeArray = [
        {
            model: models.user,
            as: "appraiser",
            attributes: ['id', 'firstName', 'lastName']
        },
        {
            model: models.customer,
            as: "customer",
            attributes: ['id', 'firstName', 'lastName']
        }
    ]

    let getList = await models.customerAssignAppraiser.findAll({
        where: searchQuery,
        order: [["updatedAt", "DESC"]],
        offset: offset,
        limit: pageSize,
        include: includeArray,
    });

    let count = await models.customerAssignAppraiser.count({
        where: searchQuery,
        include: includeArray,
    });

    return res.status(200).json({ message: 'success', data: getList, count })

}
