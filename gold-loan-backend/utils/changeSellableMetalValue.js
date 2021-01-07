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
        let digiGoldDeliveryOrderDetail;
        let configSettingName = "digiGoldSellableHour"
        let duration = await models.digiGoldConfigDetails.getConfigDetail(configSettingName);

        console.log("duration", duration);  //1 hr
        let customerBal;
        let dateBeforSpcifiedTime = new Date();
        let date = dateBeforSpcifiedTime.setHours(dateBeforSpcifiedTime.getHours() - Number(duration.configSettingValue));
        // let date = dateBeforSpcifiedTime.setMinutes(dateBeforSpcifiedTime.getMinutes() - Number(6));

        // let newDate = moment(moment(date).utcOffset("+05:30")).format('YYYY-MM-DD HH:mm:ss.SSS');
        let newDate = moment(date).format('YYYY-MM-DD HH:mm:ss.SSS');

        console.log("newDate", newDate);     //9.24
        allCustomer = await models.digiGoldOrderDetail.findAll({
            where: {
                orderCreatedDate: { [Op.gt]: newDate },
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

            digiGoldDeliveryOrderDetail = await models.digiGoldOrderDetail.findAll({
                where:
                {
                    orderCreatedDate:
                        { [Op.gt]: newDate },
                    customerId: customer,
                    orderTypeId: 3

                },
                include: {
                    model: models.digiGoldOrderProductDetail,
                    as: 'orderProductDetail',
                }
            });


            let totalGoldDeliveryInFixDuration = 0;
            let totalSilverDeliveryInFixDuration = 0;
            digiGoldDeliveryOrderDetail = await models.digiGoldOrderDetail.findAll({
                where:
                {
                    orderCreatedDate:
                        { [Op.gt]: newDate },
                    customerId: customer,
                    orderTypeId: 3

                }
            });
            if (digiGoldDeliveryOrderDetail.length) {
                for await (let ele of digiGoldDeliveryOrderDetail) {
                    for await (let product of ele.orderProductDetail) {
                        console.log(product);
                        if (product.metalType == "gold") {
                            totalGoldDeliveryInFixDuration += parseFloat(product.quantity);
                        }
                        if (product.metalType == "silver") {
                            totalSilverDeliveryInFixDuration += parseFloat(product.quantity)
                        }
                    }
                }
            }

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

                let buyDeliveryDifferenceGold = totalGoldBoughtInFixDuration - totalGoldDeliveryInFixDuration
                if (buyDeliveryDifferenceGold <= 0) {
                    sellableGoldBalance = customerBal.currentGoldBalance
                } else {
                    sellableGoldBalance = customerBal.currentGoldBalance - buyDeliveryDifferenceGold;
                    // sellableGoldBalance = customerBal.sellableGoldBalance + (customerBal.currentGoldBalance - buyDeliveryDifferenceGold);
                }

                let buyDeliveryDifferenceSilver = totalSilverBoughtInFixDuration - totalSilverDeliveryInFixDuration
                if (buyDeliveryDifferenceSilver <= 0) {
                    sellableSilverBalance = customerBal.currentSilverBalance
                } else {
                    sellableSilverBalance = customerBal.currentSilverBalance - buyDeliveryDifferenceSilver;
                    // sellableSilverBalance = customerBal.sellableSilverBalance + (customerBal.currentSilverBalance - buyDeliveryDifferenceSilver);
                }

                console.log("sellableGoldBalance", sellableGoldBalance, "sellableSilverBalance", sellableSilverBalance);

                await models.digiGoldCustomerBalance.update({
                    sellableGoldBalance: sellableGoldBalance,
                    sellableSilverBalance: sellableSilverBalance
                },
                    {
                        where: { customerId: customer }
                    });
            }

        }
        console.log("nonRepeatCustomerId", nonRepeatCustomerId);
        // let newDateBeforfifteenMin = moment(newDate).subtract(3, 'minutes').format('YYYY-MM-DD HH:mm:ss.SSS');
        let newDateBeforfifteenMin = moment(newDate).subtract(15, 'minutes').format('YYYY-MM-DD HH:mm:ss.SSS');
        console.log(newDateBeforfifteenMin);
        // if (nonRepeatCustomerId.length) {
        // allCustomerBeforScheduleTime = await models.digiGoldOrderDetail.findAll({
        //     where: {
        //         orderCreatedDate: { [Op.between]: [newDateBeforfifteenMin, newDate] },
        //         customerId: { [Op.notIn]: [nonRepeatCustomerId]}
        //         // orderTypeId: 1
        //     }
        // });
        allCustomerBeforScheduleTime = await models.digiGoldOrderDetail.findAll({
            where: {
                orderCreatedDate: { [Op.between]: [newDateBeforfifteenMin, newDate] },
                customerId: { [Op.notIn]: nonRepeatCustomerId }
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
        // }

        return
    } catch (err) {
        console.log(err);
    }

}