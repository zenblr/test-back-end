const models = require('../../models');
const check = require('../../lib/checkLib');
const extend = require('extend')
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION
const _ = require('lodash');
let { sendMessageAssignedCustomerToAppraiser, sendMessageCustomerForAssignAppraiser } = require('../../utils/SMS');
const { orderBy } = require('lodash');
const { VIEW_ALL_CUSTOMER } = require('../../utils/permissionCheck')


//FUNCTION TO ADD NEW REQUEST 
exports.addAppraiserRequest = async (req, res, next) => {
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let { customerId, moduleId } = req.body;

    let status = await models.status.findOne({ where: { statusName: "confirm" } })
    let statusId = status.id

    let checkStatusCustomer = await models.customer.findOne({
        where: { statusId, id: customerId },
        include: {
            model: models.customerKyc,
            as: 'customerKyc'
        }
    });

    if (!check.isEmpty(checkStatusCustomer.customerKyc)) {
        let oldReqModule = checkStatusCustomer.customerKyc.currentKycModuleId;

        if (oldReqModule != moduleId) {
            if (moduleId == 1) {
                if (checkStatusCustomer.scrapKycStatus != "approved") {
                    return res.status(404).json({ message: "Kindly complete your pending scrap KYC" });
                }
            }
            if (moduleId == 3) {
                if (checkStatusCustomer.kycStatus != "approved") {
                    return res.status(404).json({ message: "Kindly complete your pending loan KYC" });
                }
            }
        }


    }


    if (checkStatusCustomer.scrapKycStatus == "approved") {
        if (checkStatusCustomer.userType == "Corporate") {
            return res.status(400).json({ message: "Please create new customer since you have completed Corporate kyc" });
        }
    }

    let requestExist = await models.appraiserRequest.findOne({ where: { moduleId: moduleId, customerId: customerId, status: 'incomplete' } })

    if (!check.isEmpty(requestExist)) {
        return res.status(400).json({ message: 'This product Request already Exists' });
    }

    await sequelize.transaction(async (t) => {
        let modulePoint = await models.module.findOne({ where: { id: moduleId }, transaction: t })
        let checkPoint = checkStatusCustomer.allModulePoint & modulePoint.modulePoint
        if (checkPoint == 0) {
            let updatePoint = checkStatusCustomer.allModulePoint | modulePoint.modulePoint
            await models.customer.update({ allModulePoint: updatePoint, where: { id: customerId }, transaction: t });
        }
        let appraiserRequest = await models.appraiserRequest.create({ customerId, moduleId, createdBy, modifiedBy }, { transaction: t })
    })
    return res.status(201).json({ message: `Request Created` })
}

//FUNCTION TO UPDATE NEW REQUEST
exports.updateAppraiserRequest = async (req, res, next) => {
    let modifiedBy = req.userData.id;
    let id = req.params.id;
    let { moduleId, customerId } = req.body;
    let requestExist = await models.appraiserRequest.findOne({ where: { moduleId: moduleId, customerId: customerId, status: 'incomplete' } })
    if (!check.isEmpty(requestExist)) {
        return res.status(400).json({ message: 'This product Request already Exists' });
    }

    await sequelize.transaction(async (t) => {
        let modulePoint = await models.module.findOne({ where: { id: moduleId }, transaction: t })
        let checkPoint = checkStatusCustomer.allModulePoint & modulePoint.modulePoint
        if (checkPoint == 0) {
            let updatePoint = checkStatusCustomer.allModulePoint | modulePoint.modulePoint
            await models.customer.update({ allModulePoint: updatePoint, where: { id: customerId }, transaction: t });
        }

        let appraiserRequest = await models.appraiserRequest.update({ moduleId, modifiedBy }, { where: { id }, transaction: t })
    })

    return res.status(200).json({ message: `Request updated` })

}
//FUNCTION TO VIEW ALL REQUESTS
exports.getAllNewRequest = async (req, res, next) => {
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);
    let query = {};

    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                "$customer.first_name$": { [Op.iLike]: search + '%' },
                "$customer.last_name$": { [Op.iLike]: search + '%' },
                "$customer.customer_unique_id$": { [Op.iLike]: search + '%' },
                "$customer.mobile_number$": { [Op.iLike]: search + '%' },
                "$module.module_name$": { [Op.iLike]: search + '%' }
            },
        }]
    };
    let customerSearch = { isActive: true }

    if (!check.isPermissionGive(req.permissionArray, VIEW_ALL_CUSTOMER)) {
        customerSearch = { isActive: true, internalBranchId: req.userData.internalBranchId }
    }

    let associateModel = [
        {
            model: models.customer,
            // required: false,
            as: 'customer',
            where: customerSearch,
            attributes: ['id', 'customerUniqueId', 'firstName', 'lastName', 'mobileNumber', 'kycStatus', 'internalBranchId', 'scrapKycStatus'],
            include: [
                {
                    model: models.customerKyc,
                    as: 'customerKyc',
                    attributes: ['id', 'isKycSubmitted', 'isScrapKycSubmitted', 'isAppliedForKyc']
                }
            ]
        },
        {
            model: models.customerLoanMaster,
            as: 'masterLoan',
            attributes: ['id', 'isLoanTransfer', 'isLoanCompleted'],
        },
        {
            model: models.module,
            as: 'module',
        },
        {
            model: models.user,
            as: 'appraiser',
        },
    ]
    console.log(req.userData)
    if (req.userData.userTypeId == 7) {
        searchQuery.appraiserId = req.userData.id
    }
    // console.log(searchQuery)
    let allRequest = await models.appraiserRequest.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
        order: [
            ['id', 'DESC']
        ],
        offset: offset,
        limit: pageSize,
    });

    let count = await models.appraiserRequest.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
    });


    if (allRequest.length === 0) {
        return res.status(200).json({ data: [] })
    } else {
        return res.status(200).json({ message: `Fetched all request successfully`, data: allRequest, count: count.length })
    }
}

//FUNCTION TO ASSIGN APPRAISER 
exports.assignAppraiser = async (req, res) => {
    //console.log(req.body)
    // let requestId = req.params.id;
    const { id, appraiserId, appoinmentDate, startTime, endTime } = req.body;
    let modifiedBy = req.userData.id;
    let requestInfo = await models.appraiserRequest.findOne({ where: { id: id } });
    let customerInfo = await models.customer.findOne({ where: { id: requestInfo.customerId } })
    let { mobileNumber, firstName, userUniqueId } = await models.user.findOne({ where: { id: appraiserId } })

    const data = await models.appraiserRequest.update({ appraiserId, appoinmentDate, startTime, endTime, modifiedBy, isAssigned: true }, { where: { id: id } })

    await sendMessageAssignedCustomerToAppraiser(mobileNumber, firstName, customerInfo.customerUniqueId);

    await sendMessageCustomerForAssignAppraiser(customerInfo.mobileNumber, firstName, userUniqueId, customerInfo.firstName)


    if (data.length === 0) {
        return res.status(404).json({ message: "Appraiser not assigned to request" });
    } else {
        return res.status(200).json({ message: "Appraiser assigned to request" });
    }
}

exports.updateAppraiser = async (req, res) => {
    let requestId = req.params.id
    const { id, appraiserId, appoinmentDate, startTime, endTime } = req.body;
    let modifiedBy = req.userData.id;

    let requestInfo = await models.appraiserRequest.findOne({ where: { id: id } });
    let customerInfo = await models.customer.findOne({ where: { id: requestInfo.customerId } })
    let { mobileNumber, firstName, userUniqueId } = await models.user.findOne({ where: { id: appraiserId } })

    const data = await models.appraiserRequest.update({ appraiserId, appoinmentDate, startTime, endTime, modifiedBy, isAssigned: true }, { where: { id: id } })
    //console.log(data)
    if (requestInfo.appraiserId != appraiserId) {
        await sendMessageAssignedCustomerToAppraiser(mobileNumber, firstName, customerInfo.customerUniqueId);

        await sendMessageCustomerForAssignAppraiser(customerInfo.mobileNumber, firstName, userUniqueId, customerInfo.firstName)

    }


    if (data.length === 0) {
        return res.status(404).json({ message: "Appraiser not assigned to request" });
    } else {
        return res.status(200).json({ message: "Appraiser assigned to request" });
    }
}

//FUNCTION TO GET ASSIGNED REQUEST(S)
exports.getAssignedRequest = async (req, res) => {
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);
    let query = {};

    let searchQuery = {
        [Op.and]: [
            { appraiserId: req.userData.id },
            query,
            {
                [Op.or]: {
                    "$customer.first_name$": { [Op.iLike]: search + '%' },
                    "$customer.last_name$": { [Op.iLike]: search + '%' },
                    "$customer.customer_unique_id$": { [Op.iLike]: search + '%' },
                    "$customer.mobile_number$": { [Op.iLike]: search + '%' },
                    "$module.module_name$": { [Op.iLike]: search + '%' }
                },
            }]
    };

    let associateModel = [
        {
            model: models.customer,
            required: false,
            as: 'customer',
            where: { isActive: true },
            attributes: ['id', 'customerUniqueId', 'firstName', 'lastName', 'mobileNumber', 'kycStatus']
        },
        {
            model: models.module,
            as: 'module',
            attributes: ['id', 'moduleName']

        },
    ]

    let allRequest = await models.appraiserRequest.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
        order: [
            ['id', 'DESC']
        ],
        offset: offset,
        limit: pageSize,
    });

    let data = await _.chain(allRequest)
        .groupBy("customerId")
        .map((value, key) => ({ customerId: key, users: value }))
        .value()

    let allCount = await models.appraiserRequest.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
    });
    let count = await _.chain(allCount)
        .groupBy("customerId")
        .map((value, key) => ({ customerId: key, users: value }))
        .value()

    if (allRequest.length === 0) {
        return res.status(200).json({ data: [] })
    } else {
        return res.status(200).json({ message: `Fetched all request successfully`, data: data, count: count.length })
    }
}
