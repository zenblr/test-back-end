const formData = require('form-data');
// const redis = require('redis');
const moment = require('moment');
const models = require('../models');
const data = new formData();
// const redisConn = require('../config/redis')
const check = require('../lib/checkLib');
// const redisClient = redis.createClient(redisConn.PORT, redisConn.HOST);
const qs = require('qs');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const _ = require('lodash');

module.exports = async () => {
    try {
        let digiGoldOrderDetail;

        let configSettingName = "digiGoldSellableHour"
        let duration = await models.digiGoldConfigDetails.getConfigDetail(configSettingName);

        console.log("duration", duration);  //1 hr
        let customerBal;
        let dateBeforSpcifiedTime = new Date();
        let date = dateBeforSpcifiedTime.setHours(dateBeforSpcifiedTime.getHours() - Number(duration.configSettingValue));
        // let newDate = moment(moment(date).utcOffset("+05:30")).format('YYYY-MM-DD HH:mm:ss.SSS');
        let newDate = moment(date).format('YYYY-MM-DD HH:mm:ss.SSS');

        console.log("newDate", newDate);     //9.24
        allCustomer = await models.digiGoldOrderDetail.findAll({
            where: {
                createdAt: { [Op.gt]: newDate },
                orderTypeId: 1
            }
        });
        console.log("allCustomer", allCustomer);
        let allCustomerId = [];

        for (let data of allCustomer) {
            allCustomerId.push(data.customerId)
        }
        const nonRepeatCustomerId = _.uniq(allCustomerId);
        console.log(nonRepeatCustomerId);   // 262 

        for (let customer of nonRepeatCustomerId) {
            digiGoldOrderDetail = await models.digiGoldOrderDetail.findAll({
                where:
                {
                    createdAt:
                        { [Op.gt]: newDate },
                    customerId: customer,
                    orderTypeId: 1

                }
            });
            console.log("digiGoldOrderDetail ", digiGoldOrderDetail);   // 262

            customerBal = await models.digiGoldCustomerBalance.findOne({ where: { customerId: customer } });
            console.log("customerBal", customerBal.currentGoldBalance, customerBal.currentSilverBalance);   // 262

            let totalGoldBoughtInFixDuration = 0;
            let totalSilverBoughtInFixDuration = 0;
            let sellableGoldBalance;
            let sellableSilverBalance;
            if (digiGoldOrderDetail.length) {
                for (let ele of digiGoldOrderDetail) {

                    if (ele.metalType == "gold") {
                        totalGoldBoughtInFixDuration += parseFloat(ele.quantity);
                    }
                    if (ele.metalType == "silver") {
                        totalSilverBoughtInFixDuration += parseFloat(ele.quantity)
                    }
                }
                console.log("gold silver", totalGoldBoughtInFixDuration, totalSilverBoughtInFixDuration);

                sellableGoldBalance = customerBal.currentGoldBalance - totalGoldBoughtInFixDuration;

                sellableSilverBalance = customerBal.currentSilverBalance - totalSilverBoughtInFixDuration;

                console.log("sellableGoldBalance    ", sellableGoldBalance, "sellableSilverBalance    ", sellableSilverBalance);

                await models.digiGoldCustomerBalance.update({
                    sellableGoldBalance: sellableGoldBalance,
                    sellableSilverBalance: sellableSilverBalance
                },
                    {
                        where: { customerId: customer }
                    });
            }

        }

        let newDateBeforfifteenMin = moment(newDate).subtract(15, 'minutes').format('YYYY-MM-DD HH:mm:ss.SSS');
        console.log(newDateBeforfifteenMin);
        allCustomerBeforScheduleTime = await models.digiGoldOrderDetail.findAll({
            where: {
                createdAt: { [Op.between]: [newDateBeforfifteenMin, newDate] },
                // orderTypeId: 1
            }
        });
        console.log("allCustomerBeforScheduleTime", allCustomerBeforScheduleTime)
        if (allCustomerBeforScheduleTime.length) {
            for (let data of allCustomerBeforScheduleTime) {
                allCustomerId.push(data.customerId)
            }
            const nonRepeatCustomerNewId = _.uniq(allCustomerId);
            console.log(nonRepeatCustomerNewId);   // 262

            for (let customer of nonRepeatCustomerNewId) {

                let newCustomerBal = await models.digiGoldCustomerBalance.findOne({ where: { customerId: customer } });
                console.log("newCustomerBal.currentGoldBalance, newCustomerBal.currentSilverBalance", newCustomerBal.currentGoldBalance, newCustomerBal.currentSilverBalance);
                await models.digiGoldCustomerBalance.update({
                    sellableGoldBalance: newCustomerBal.currentGoldBalance,
                    sellableSilverBalance: newCustomerBal.currentSilverBalance
                },
                    {
                        where: { customerId: customer }
                    });
            }
        }

        return
    } catch (err) {
        console.log(err);
    }

}