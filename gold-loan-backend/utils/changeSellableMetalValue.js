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
        let dateBeforSpcifiedTime = moment()
        // let abcd = new Date()
        // console.log(dateBeforSpcifiedTime)
        // console.log(abcd)
        // let date = dateBeforSpcifiedTime.setHours(dateBeforSpcifiedTime.getHours() - Number(duration.configSettingValue));
        let date = moment(dateBeforSpcifiedTime).subtract(Number(duration.configSettingValue), 'h').format('YYYY-MM-DD HH:mm:ss.SSS');
        // let date = dateBeforSpcifiedTime.setMinutes(dateBeforSpcifiedTime.getMinutes() - Number(6));
        let newDate = moment(moment(date)).format('YYYY-MM-DD HH:mm:ss.SSS');

        // let newDateutcOffset = moment(moment(date).utcOffset("+05:30")).format('YYYY-MM-DD HH:mm:ss.SSS');
        // let newDateWithOut = moment(date).format('YYYY-MM-DD HH:mm:ss.SSS');
        // var utcStart = new moment(moment(date), "YYYY-MM-DD HH:mm:ss.SSS").utc();
        console.log("newDate", newDate);     //9.24

        // console.log(newDateutcOffset)
        // console.log(newDateWithOut)
        // console.log(utcStart)
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

            digiGoldOrderDetail = await models.digiGoldOrderDetail.findAll({
                where:
                {
                    orderCreatedDate:
                        { [Op.gt]: newDate },
                    customerId: customer,
                    orderTypeId: 1

                }
            });
            if (digiGoldDeliveryOrderDetail.length) {
                for (let ele of digiGoldDeliveryOrderDetail) {
                    console.log(ele);
                    for (let product of ele.orderProductDetail) {
                        console.log(product);
                        if (product.metalType == "gold") {
                            totalGoldDeliveryInFixDuration += parseFloat(product.productWeight * product.quantity);
                        }
                        if (product.metalType == "silver") {
                            totalSilverDeliveryInFixDuration += parseFloat(product.productWeight * product.quantity)
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
                console.log("gold silver", totalGoldBoughtInFixDuration, totalSilverBoughtInFixDuration)
                // let buyDeliveryDifferenceGold = totalGoldBoughtInFixDuration - totalGoldDeliveryInFixDuration
                // if (buyDeliveryDifferenceGold <= 0) {
                //     sellableGoldBalance = customerBal.sellableGoldBalance
                // } else {
                //     sellableGoldBalance = customerBal.currentGoldBalance - buyDeliveryDifferenceGold;
                //     // sellableGoldBalance = customerBal.sellableGoldBalance + (customerBal.currentGoldBalance - buyDeliveryDifferenceGold);

                // }
                if (totalGoldBoughtInFixDuration > totalGoldDeliveryInFixDuration) {
                    let buyDeliveryDifferenceGold = totalGoldBoughtInFixDuration - totalGoldDeliveryInFixDuration
                    sellableGoldBalance = customerBal.currentGoldBalance - buyDeliveryDifferenceGold;
                    console.log(buyDeliveryDifferenceGold, customerBal.currentGoldBalance, "131")
                } else {
                    sellableGoldBalance = customerBal.sellableGoldBalance
                    console.log("135")
                }

                console.log(sellableGoldBalance)

                // let buyDeliveryDifferenceSilver = totalSilverBoughtInFixDuration - totalSilverDeliveryInFixDuration
                // if (buyDeliveryDifferenceSilver <= 0) {
                //     sellableSilverBalance = customerBal.sellableSilverBalance
                // } else {
                //     sellableSilverBalance = customerBal.currentSilverBalance - buyDeliveryDifferenceSilver;
                //     // sellableSilverBalance = customerBal.sellableSilverBalance + (customerBal.currentSilverBalance - buyDeliveryDifferenceSilver);
                // }
                if (totalSilverBoughtInFixDuration > totalSilverDeliveryInFixDuration) {
                    let buyDeliveryDifferenceSilver = totalSilverBoughtInFixDuration - totalSilverDeliveryInFixDuration
                    sellableSilverBalance = customerBal.currentSilverBalance - buyDeliveryDifferenceSilver;
                } else {
                    sellableSilverBalance = customerBal.sellableSilverBalance
                }

                console.log("sellableGoldBalance", sellableGoldBalance, "sellableSilverBalance", sellableSilverBalance);
                let newSellableGoldBalance = sellableGoldBalance.toFixed(4);
                let newSellableSilverBalance = sellableSilverBalance.toFixed(4);
                await models.digiGoldCustomerBalance.update({
                    sellableGoldBalance: Number(newSellableGoldBalance),
                    sellableSilverBalance: Number(newSellableSilverBalance)
                },
                    {
                        where: { customerId: customer }
                    });
            }

        }
        console.log("nonRepeatCustomerId", nonRepeatCustomerId);
        // let newDateBeforfifteenMinwithOut = moment(newDate).subtract(5, 'minutes').format('YYYY-MM-DD HH:mm:ss.SSS');
        let newDateBeforfifteenMin = moment(newDate).subtract(15, 'minutes').format('YYYY-MM-DD HH:mm:ss.SSS');
        // console.log(newDateBeforfifteenMinwithOut, 'without offset')
        console.log(newDateBeforfifteenMin, 'with')

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
            console.log(nonRepeatCustomerNewId, "191") ;   // 262

            for (let customer of nonRepeatCustomerNewId) {

                let newCustomerBal = await models.digiGoldCustomerBalance.findOne({ where: { customerId: customer } });
                console.log("newCustomerBal.currentGoldBalance, newCustomerBal.currentSilverBalance", newCustomerBal.currentGoldBalance, newCustomerBal.currentSilverBalance);
                let newSellableGoldBalance = newCustomerBal.currentGoldBalance.toFixed(4);
                let newSellableSilverBalance = newCustomerBal.currentSilverBalance.toFixed(4)
                await models.digiGoldCustomerBalance.update({
                    sellableGoldBalance: Number(newSellableGoldBalance),
                    sellableSilverBalance: Number(newSellableSilverBalance)
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