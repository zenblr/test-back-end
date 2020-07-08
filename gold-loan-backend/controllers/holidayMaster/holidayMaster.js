const models = require('../../models');
const check = require("../../lib/checkLib");
const sequelize = models.sequelize;
const { paginationWithFromTo } = require("../../utils/pagination");
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;


// adding holiday list
exports.addHolidayMaster = async (req, res) => {
    const { holidayDate, description, year } = req.body;
    let modifiedBy = req.userData.id;
    let createdBy = req.userData.id;
    // let modifiedTime=Date.now();
    let holidayDateExist = await models.holidayMaster.findOne({ where: { holidayDate: holidayDate, isActive: true } });
    if (!check.isEmpty(holidayDateExist)) {
        return res.status(404).json({ message: "This holiday date already Exists" });
    }
    let addHolidayMasterData = await models.holidayMaster.create({ holidayDate, description, year, modifiedBy, createdBy });
    if (!addHolidayMasterData) {
        return res.status(422).json({ message: 'holidayMaster not created' });
    }
    return res.status(201).json({ message: 'holiday Master is created' });
}

// update holiday list
exports.updateHolidayMaster = async (req, res) => {
    const id = req.params.id;
    let modifiedBy = req.userData.id;
    const { holidayDate, description, year } = req.body;

    let updateHolidayMaster = await models.holidayMaster.update({ holidayDate, description, year, modifiedBy }, { where: { id: id, isActive: true } });
    if (!updateHolidayMaster[0]) {
        return res.status(404).json({ message: 'holiday master updated failed' });
    }
    return res.status(200).json({ message: 'success' });
}

//read Holiday List
exports.readHolidayMaster = async (req, res) => {
    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );
    const searchQuery = {
        [Op.or]: {
            holidayDate: sequelize.where(
                sequelize.cast(sequelize.col("holiday_date"), "varchar"),
                {
                    [Op.iLike]: search + "%"
                }),
            description: { [Op.iLike]: search + "%" },
            year: sequelize.where(
                sequelize.cast(sequelize.col("year"), "varchar"),
                {
                    [Op.iLike]: search + "%"
                }),
        },
        isActive: true,
    };
    let readHolidayMaster = await models.holidayMaster.findAll({
        where: { isActive: true },
        where: searchQuery,
        order: [["holidayDate", "ASC"]],
        offset: offset,
        subQuery: false,
        limit: pageSize,
        include: [
            {
                model: models.user,
                as: "Createdby",

            },
            {
                model: models.user,
                as: "Modifiedby",

            },]
    });
    let count = await models.holidayMaster.findAll({
        where: searchQuery,
        include: [
            {
                model: models.user,
                as: "Createdby",

            },
            {
                model: models.user,
                as: "Modifiedby",

            },],
        subQuery: false
    });
    if (readHolidayMaster.length === 0) {
        return res.status(200).json([]);
    }
    return res.status(200).json({ data: readHolidayMaster, count: count.length });
}
// read holiday list by id
exports.readHolidayMasterById = async (req, res) => {
    const id = req.params.id;
    let readHolidayMasterById = await models.holidayMaster.findOne({
        where: { isActive: true, id: id },
        include: [
            {
                model: models.user,
                as: "Createdby",

            },
            {
                model: models.user,
                as: "Modifiedby",

            },],
    });
    if (!readHolidayMasterById) {
        return res.status(404).json({ message: 'data not found' })
    }
    return res.status(200).json({ readHolidayMasterById });
}

// deactive holiday list
exports.deactiveHolidayMaster = async (req, res) => {
    const { id, isActive } = req.query;
    let deactiveHolidayMaster = await models.holidayMaster.update({ isActive: isActive }, { where: { id: id } });
    if (!deactiveHolidayMaster[0]) {
        return res.status(404).json({ message: 'holiday master deleted failed' });
    }
    return res.status(200).json({ message: `Updated` })
}
