const models = require('../../models');
const check = require('../../lib/checkLib');
const extend = require('extend')
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION
const _ = require('lodash');

//FUNCTION TO ADD NEW REQUEST 
exports.addLeadNewRequest = async (req, res, next) => {
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let { customerId, moduleId } = req.body;
    
    let LeadNewRequest = await models.leadNewRequest.create({ customerId, moduleId, createdBy, modifiedBy })
    return res.status(201).json({ message: `Request Created` })
}

//FUNCTION TO UPDATE NEW REQUEST
exports.updateLeadNewRequest = async (req, res, next) => {
    let modifiedBy = req.userData.id;
    let id = req.params.id;
    let { moduleId, customerId } = req.body;

    let LeadNewRequest = await models.leadNewRequest.update({ moduleId, modifiedBy }, { where: { id, isAssigned: false } })
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
                "$customer.customer_unique_id$": { [Op.iLike]: search + '%' }
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
        {
            model: models.user,
            as: 'appraiser'
        }
    ]

    let allRequest = await models.leadNewRequest.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
        order: [
            ['id', 'DESC']
        ],
        offset: offset,
        limit: pageSize,
    });

    let count = await models.leadNewRequest.count({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
    });


    if (allRequest.length === 0) {
        return res.status(404).json([])
    } else {
        return res.status(200).json({ message: `Fetched all request successfully`, data: allRequest, count: count })
    }
}

//FUNCTION TO ASSIGN APPRAISER 
exports.assignAppraiser = async (req, res) => {
    //console.log(req.body)
    let requestId = req.params.id;
    const { appraiserId } = req.body;
    let modifiedBy = req.userData.id;


    const data = await models.leadNewRequest.update({ appraiserId, modifiedBy, isAssigned: true }, { where: { id: requestId } })
    //console.log(data)
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
                    "$customer.customer_unique_id$": { [Op.iLike]: search + '%' }
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

        }
    ]

    let allRequest = await models.leadNewRequest.findAll({
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

    let allCount = await models.leadNewRequest.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
    });
    let count = await _.chain(allCount)
        .groupBy("customerId")
        .map((value, key) => ({ customerId: key, users: value }))
        .value()

    if (allRequest.length === 0) {
        return res.status(404).json([])
    } else {
        return res.status(200).json({ message: `Fetched all request successfully`, data: data, count: count.length })
    }
}
