const csv = require('csvtojson')
const models = require("../../models");
const sequelize = models.sequelize;
const _ = require('lodash');
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const moment = require('moment')
const check = require('../../lib/checkLib');

// upload scheme csv
exports.uploadHolidayMaster = async (req, res, next) => {

    const csvFilePath = req.file.path;
    const jsonArray = await csv().fromFile(csvFilePath);
    if (jsonArray.length == 0) { return res.status(400).json({ message: `Your file is empty.` }) }
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    for (var i = 0; i < jsonArray.length; i++) {
        if (check.isEmpty(jsonArray[i].HolidayDate)) {
            return res.status(400).json({ message: `Holiday Date is required` })
        }
        if (check.isEmpty(jsonArray[i].Description)) {
            return res.status(400).json({ message: `Description is required` })
        }
    }

    let holidayList = await jsonArray.map(value => {
        console.log(value)
        let properDateArray = moment(value.HolidayDate).format('YYYY-MM-DD')
        return properDateArray
    })

    var repeatHolidayListData = _.filter(holidayList, (val, i, iteratee) => _.includes(iteratee, val, i + 1));
    if (repeatHolidayListData.length > 0) {
        return res.status(400).json({ message: `The CSV file contains a duplicate date` })
    }
   
    var contain = await models.holidayMaster.findAll({ where: { holidayDate: { [Op.in]: holidayList }, isActive: true } })
    
    if (contain.length > 0) {
        let existHolidayDate = await contain.map(value => { return value.holidayDate });
        return res.status(400).json({ message: `${existHolidayDate} these holiday dates already Exists` })

    }
    await sequelize.transaction(async t => {

        for (var i = 0; i < jsonArray.length; i++) {
            console.log(jsonArray[i].HolidayDate)
            let bm = jsonArray[i].HolidayDate
            let properDate = moment(bm).format('YYYY-MM-DD')
            var addHolidayMasterData = await models.holidayMaster.create({
                holidayDate: properDate, description: jsonArray[i].Description, year: jsonArray[i].Year, createdBy, modifiedBy
            },
                { transaction: t });
        }
    })
    return res.status(201).json({ message: "Holiday Master List Created" });

}

