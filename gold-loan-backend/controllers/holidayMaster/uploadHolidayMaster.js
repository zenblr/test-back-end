const csv = require('csvtojson')
const models = require("../../models");
const sequelize = models.sequelize;
const _ = require('lodash');
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const moment = require('moment')


// upload scheme csv
exports.uploadHolidayMaster = async (req, res, next) => {
    
        const csvFilePath = req.file.path;
        const jsonArray = await csv().fromFile(csvFilePath);
        if (jsonArray.length == 0) { return res.status(400).json({ message: `Your file is empty.` }) }
        let createdBy = req.userData.id;
        let modifiedBy = req.userData.id;

        let holidayList = await jsonArray.map(value => {
            console.log(value)
            let properDateArray = moment(value.HolidayDate, "DD-MM-YYYY").format('YYYY-MM-DD')
            return properDateArray
        })

        var repeatHolidayListData = _.filter(holidayList, (val, i, iteratee) => _.includes(iteratee, val, i + 1));
        if (repeatHolidayListData.length > 0) {
            return res.status(400).json({ message: `The CSV file contains a duplicate date` })
        }
        var contain = await models.holidayMaster.findAll({ where: { holidayDate: { [Op.in]: holidayList }, isActive: true } })
        if (contain.length > 0) {
            let existHolidayDate = await contain.map(value => { return value.holidayDate });
            if(existHolidayDate.length > 1){
                return res.status(400).json({ message: `${existHolidayDate} these holiday dates already Exists` })
            }else{
                return res.status(400).json({ message: `${existHolidayDate} this holiday date already Exists` });
            }
        }
        await sequelize.transaction(async t => {

            for (var i = 0; i < jsonArray.length; i++) {
                console.log(jsonArray[i].HolidayDate)
                let bm = jsonArray[i].HolidayDate
                let properDate = moment(bm, "DD-MM-YYYY").format('YYYY-MM-DD')
                var addHolidayMasterData = await models.holidayMaster.create({
                    holidayDate: properDate, description: jsonArray[i].Description, year: jsonArray[i].Year, createdBy, modifiedBy
                },
                    { transaction: t });
            }
        })
        return res.status(201).json({ message: "Holiday Master List Created" });
  
}

