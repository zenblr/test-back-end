const models = require("../../models");
const sequelize = models.sequelize;
const paginationFUNC = require("../../utils/pagination"); // importing pagination function
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

const check = require("../../lib/checkLib");

//add partner
exports.addPartner = async (req, res, next) => {
  const { name, commission, submitPacketInInternalBranch } = req.body;

  let createdBy = req.userData.id;
  let modifiedBy = req.userData.id;

  let partnerExist = await models.partner.findOne({
    where: { name, isActive: true },
  });
  if (!check.isEmpty(partnerExist)) {
    return res.status(404).json({ message: "This Partner is already Exist" });
  }
  let modifiedTime = Date.now();
  await sequelize.transaction(async (t) => {
    let partnerData = await models.partner.create(
      { name, commission, submitPacketInInternalBranch, createdBy, modifiedBy },
      { transaction: t }
    );
    let id = partnerData.dataValues.id;
    let partnerId = partnerData.dataValues.name.slice(0, 3).toUpperCase() + "-" + id;
    await models.partner.update(
      { partnerId: partnerId },
      { where: { id: id }, transaction: t }
    );

    await models.partnerCommissionHistory.create({ partnerId: id, commission, modifiedBy: createdBy, modifiedTime }, { transaction: t })
    return partnerData;
  });
  return res.status(201).json({ messgae: "partner created" });
};
//update partner

exports.updatePartner = async (req, res, next) => {
  const partnerId = req.params.id;
  const { name, commission, submitPacketInInternalBranch } = req.body;
  let modifiedBy = req.userData.id;
  let modifiedTime = Date.now();

  // let pId = name.slice(0, 3).toUpperCase() + "-" + partnerId;

  await sequelize.transaction(async (t) => {

    let updatePartnerData = await models.partner.update(
      { name, commission, submitPacketInInternalBranch, modifiedBy },
      { where: { id: partnerId, isActive: true }, transaction: t }
    );

    let partnerInfo = await models.partner.findOne({ id: partnerId });

    if (commission != partnerInfo.commission) {
      await models.partnerCommissionHistory.create({ partnerId, commission, modifiedBy, modifiedTime }, { transaction: t })
    }
  })

  return res.status(200).json({ message: "Success" });
};

//get partner

exports.readPartner = async (req, res, next) => {
  if (req.query.from == 1 && req.query.to == -1) {
    let readPartnerData = await models.partner.findAll({ where: { isActive: true } });
    return res.status(200).json({ data: readPartnerData });
  } else {
    const { search, offset, pageSize } = paginationFUNC.paginationWithFromTo(
      req.query.search,
      req.query.from,
      req.query.to
    );
    const searchQuery = {
      [Op.or]: {
        name: { [Op.iLike]: search + "%" },
        partnerId: { [Op.iLike]: search + "%" },
        commission: sequelize.where(
          sequelize.cast(sequelize.col("partner.commission"), "varchar"),
          {
            [Op.iLike]: search + "%",
          }
        ),
      },
      isActive: true,
    };
    let readPartnerData = await models.partner.findAll({
      where: searchQuery,
      order: [["updatedAt", "DESC"]],
      offset: offset,
      limit: pageSize,
    });

    let count = await models.partner.count({
      where: searchQuery,
      order: [["updatedAt", "DESC"]],
    });

    if (!readPartnerData) {
      return res.status(200).json({ message: "data not found" });
    }
    return res.status(200).json({ data: readPartnerData, count: count });
  }
};

//get partner by id

exports.readPartnerById = async (req, res, next) => {
  const partnerId = req.params.id;
  let partnerData = await models.partner.findOne({
    where: { id: partnerId, isActive: true },
  });
  if (check.isEmpty(partnerData)) {
    return res.status(404).json({ message: "data not found" });
  }
  return res.status(200).json(partnerData);
};

//delete partner by id

exports.deletePartner = async (req, res, next) => {
  const { id, isActive } = req.query;
  const partner = await models.partner.update(
    { isActive: isActive },
    { where: { id: id } }
  );

  if (partner[0] == 0) {
    return res.status(404).json({ message: "partner deleted failed" });
  }
  return res.status(200).json({ message: `Updated` });
};
