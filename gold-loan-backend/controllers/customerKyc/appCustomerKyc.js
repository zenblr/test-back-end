const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const request = require("request");
const { createReferenceCode } = require("../../utils/referenceCode");
const CONSTANT = require("../../utils/constant");
const moment = require("moment");
const { paginationWithFromTo } = require("../../utils/pagination");

const check = require("../../lib/checkLib");

exports.submitAppKyc = async (req, res, next) => {

}

exports.getAssignedCustomer = async (req, res, next) => {

    const id = req.userData.id
    let getAppraisal = await models.customerAssignAppraiser.findAll({
        where: { appraiserId: id },
        order: [
            // [models.customerKycAddressDetail, 'id', 'asc']
        ],
        attributes: ['appraiserId', 'appoinmentDate', 'startTime', 'endTime'],
        include: [
            {
                model: models.customer,
                as: 'customer',
                attributes: { exclude: ['customerUniqueId', 'internalBranchId', 'password', 'createdBy', 'modifiedBy', 'createdAt', 'updatedAt', 'isActive', 'lastLogin'] },
                include: [
                    {
                        model: models.status,
                        as: 'status',
                        attributes: ['id', 'statusName']
                    }
                ]
            }
        ]
    })


    return res.status(200).json({ message: getAppraisal })

}