const models = require('../../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../../utils/pagination'); // IMPORTING PAGINATION FUNCTION

const check = require("../../../lib/checkLib"); // IMPORTING CHECKLIB 
const moment = require('moment');

//get function for scrap details
exports.getScrapDetailCustomerManagement = async (req, res, next) => {
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let stageId = await models.scrapStage.findOne({ where: { stageName: 'disbursed' } });
    let query = {}
    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                "$customer.first_name$": { [Op.iLike]: search + '%' },
                "$customer.last_name$": { [Op.iLike]: search + '%' },
                "$customer.customer_unique_id$": { [Op.iLike]: search + '%' },
                "$customerScrap.scrap_unique_id$": { [Op.iLike]: search + '%' },
                "$scrapDisbursement.transaction_id$": { [Op.iLike]: search + '%' },
                "$scrapDisbursement.ifsc_code$": { [Op.iLike]: search + '%' },
                "$scrapDisbursement.bank_name$": { [Op.iLike]: search + '%' },
                "$scrapDisbursement.bank_branch$": { [Op.iLike]: search + '%' },
                "$scrapDisbursement.ac_holder_name$": { [Op.iLike]: search + '%' },
                "$scrapPacketDetails.CustomerScrapPackageDetail.packet_unique_id$": { [Op.iLike]: search + '%' },
                "$scrapOrnamentsDetail.ornamentType.name$": { [Op.iLike]: search + '%' },

                finalScrapAmountAfterMelting: sequelize.where(
                    sequelize.cast(sequelize.col("customerScrap.final_scrap_amount_after_melting"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                accountNumber: sequelize.where(
                    sequelize.cast(sequelize.col("scrapDisbursement.ac_number"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                quantity: sequelize.where(
                    sequelize.cast(sequelize.col("scrapOrnamentsDetail.quantity"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                deductionWeight: sequelize.where(
                    sequelize.cast(sequelize.col("scrapOrnamentsDetail.deduction_weight"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                grossWeight: sequelize.where(
                    sequelize.cast(sequelize.col("scrapOrnamentsDetail.gross_weight"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                netWeight: sequelize.where(
                    sequelize.cast(sequelize.col("scrapOrnamentsDetail.net_weight"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
            },
        }],
        isActive: true,
        scrapStageId: stageId.id
    };
    let internalBranchId = req.userData.internalBranchId
    let internalBranchWhere;
    if (req.userData.userTypeId != 4) {
        internalBranchWhere = { isActive: true, internalBranchId: internalBranchId }
    } else {
        internalBranchWhere = { isActive: true }
    }

    let associateModel = [
        {
            model: models.customer,
            as: 'customer',
            where: internalBranchWhere,
            attributes: ['id', 'customerUniqueId', 'firstName', 'lastName']
        },
        {
            model: models.customerScrapPersonalDetail,
            as: 'scrapPersonalDetail',
            attributes: ['startDate']
        },
        {
            model: models.customerScrapDisbursement,
            as: 'scrapDisbursement',
            attributes: ['id', 'scrapId', 'transactionId', 'paymentMode', 'ifscCode', 'bankName', 'bankBranch', 'acHolderName', 'acNumber']
        },
        {
            model: models.scrapStage,
            as: 'scrapStage',
            attributes: ['id', 'stageName']
        },
        {
            model: models.customerScrapPackageDetails,
            as: 'scrapPacketDetails',
            attributes: ['scrapId', 'emptyPacketWithRefiningOrnament', 'sealedPacketWithWeight', 'sealedPacketWithCustomer'],
            include: [{
                model: models.scrapPacket,
                as: 'CustomerScrapPackageDetail',
                attributes: ['scrapId', 'packetUniqueId']
            }]
        },
        {
            model: models.customerScrapOrnamentsDetail,
            as: 'scrapOrnamentsDetail',
            where: { isActive: true },
            attributes: ['id', 'scrapId', 'ornamentTypeId', 'quantity', 'grossWeight', 'netWeight', 'deductionWeight', 'karat', 'approxPurityReading', 'ornamentImage', 'ornamentImageWithWeight', 'ornamentImageWithXrfMachineReading', 'ltvAmount', 'scrapAmount', 'isActive'],
            include: [
                {
                    model: models.ornamentType,
                    as: "ornamentType",
                    attributes: ['id', 'name']
                }
            ]
        }
    ]

    let scrapDetails = await models.customerScrap.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
        order: [["updatedAt", "DESC"]],
        attributes: ['id', 'customerId', 'scrapUniqieId', 'finalScrapAmount', 'finalScrapAmountAfterMelting', 'eligibleScrapAmount', 'disbursementAmount'],
        offset: offset,
        limit: pageSize
    });
    let count = await models.customerScrap.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
    });
    if (scrapDetails.length === 0) {
        return res.status(200).json([]);
    } else {
        return res.status(200).json({ data: scrapDetails, count: count.length });
    }

}


exports.getsingleCustomerManagement = async (req, res) => {
    const { customerId } = req.params;
    let stageId = await models.scrapStage.findOne({ where: { stageName: 'disbursed' } })
    let singleCustomer = await models.customer.findOne({
        where: { id: customerId },
        include: [
            {
                model: models.customerKycPersonalDetail,
                as: 'customerKycPersonal',
                include: [{
                    model: models.identityType,
                    as: 'identityType',
                    attributes: ['id', 'name']
                }]
            },
            {
                model: models.customerKycAddressDetail,
                as: 'customerKycAddress',
                include: [{
                    model: models.state,
                    as: "state"
                }, {
                    model: models.city,
                    as: "city"
                }]
            },
            {
                model: models.customerScrap,
                as: 'customerScrap',
                where: { scrapStageId: stageId.id },
            }
        ]
    })

    return res.status(200).json({ message: "Success", data: singleCustomer })
}