const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
    const OrderEmiDetail = sequelize.define('orderEmiDetails', {
        orderId: {
            type: DataTypes.INTEGER,
            // allowNull: false,
            field: 'order_id'
        },
        finalOrderPrice: {
            type: DataTypes.FLOAT,
            field: 'final_order_price',
        },
        initialPayment: {
            type: DataTypes.FLOAT,
            field: 'initial_payment',
            // allowNull: true,
        },
        emiAmount: {
            type: DataTypes.FLOAT,
            field: 'emi_amount',
            allowNull: true,
        },
        emiBalancePayment: {
            type: DataTypes.FLOAT,
            field: 'emi_balance_payment',
            allowNull: true,
        },
        emiPaidAmount: {
            type: DataTypes.FLOAT,
            field: 'emi_paid_amount',
            allowNull: true,
        },
        dueDate: {
            type: DataTypes.DATE,
            // defaultValue: DataTypes.NOW,
            field: 'due_date',
            allowNull: true,
        },
        paymentDescription: {
            type: DataTypes.STRING,
            field: 'payment_description',
            allowNull: true,
        },
        paymentRecievedDate: {
            type: DataTypes.DATE,
            // defaultValue: DataTypes.NOW,
            field: 'payment_recieved_date',
            allowNull: true,
        },
        orderStatusId: {
            type: DataTypes.INTEGER,
            field: 'order_status_id'
        },
        amountFrom: {
            type: DataTypes.INTEGER,
            field: 'amount_from'
        },
        isRecentlyPayed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_recently_payed'
        },
        currentWalletBalance: {
            type: DataTypes.FLOAT,
            field: 'current_wallet_balance',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active'
        },
        walletId: {
            type: DataTypes.INTEGER,
            field: 'wallet_id',
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'emi_order_emi_details',
    });

    OrderEmiDetail.associate = function (models) {
        // OrderEmiDetail.belongsTo(models.orders, { foreignKey: 'orderId', as: 'order' });
        OrderEmiDetail.belongsTo(models.walletDetails, { foreignKey: 'walletId', as: 'walletDetails' });
        OrderEmiDetail.hasOne(models.paymentTransaction, {foreignKey: 'orderEmiId', as: 'paymentTransaction'})
        // OrderEmiDetail.belongsTo(models.orderStatus, { foreignKey: 'orderStatusId', as: 'orderemistatus' });
        // OrderEmiDetail.belongsTo(models.user, { foreignKey: 'amountFrom', as: 'receivedBy' });
    }

// OrderEmiDetail.createdOrderEmi = async ( orderId, sellingPriceOfOrder, finalProductPriceOfOrder,paymentTypeId, forwordCostForPerMonthOfOrder, initialPaymentOfOrder, balancePaymentOfOrder, paymentAmountPerMonthOfOrder, paymentMode ) => {

//     let orderEmiDetails;       
//     orderId = parseInt(orderId)

//     let roundOfEmi = Math.round(paymentAmountPerMonthOfOrder);
//     let decimalsAfterRoundOff = paymentAmountPerMonthOfOrder % 1;
//     let decimalsRoundOfThreeMonth;
//     let finalMonthEmiAmount

//             if (paymentTypeId == 1) {
//                 let Entry = 3;
//                 let date =await moment();
//                 if(paymentMode == "paymentGateway"){
//                     orderEmiDetails =  await OrderEmiDetail.create({ orderId, finalOrderPrice: finalProductPriceOfOrder.toFixed(2), initialPayment: initialPaymentOfOrder.toFixed(2), balancePayment: balancePaymentOfOrder.toFixed(2), paymentDescription: 'InitialPay', orderStatusId: 4,paymentRecievedDate:date });
//                 }else{
//                     orderEmiDetails =  await OrderEmiDetail.create({ orderId, finalOrderPrice: finalProductPriceOfOrder.toFixed(2), initialPayment: initialPaymentOfOrder.toFixed(2), balancePayment: balancePaymentOfOrder.toFixed(2), paymentDescription: 'InitialPay', orderStatusId: 1,paymentRecievedDate:date });
//                 }
                
               
//                 for (let i = 0; i < Entry; i++) {
//                     date =await moment(date).add(1, 'M');
//                     let updatedBalancePayment = balancePaymentOfOrder - paymentAmountPerMonthOfOrder * (i + 1);
//                     let updatedPaymentTag = `${i + 1} EmiPay`;

//                     decimalsRoundOfThreeMonth = decimalsAfterRoundOff * 3;
//                     finalMonthEmiAmount = decimalsRoundOfThreeMonth + roundOfEmi;
//                     if(Entry  > i + 1){
//                         await OrderEmiDetail.create({ orderId, finalOrderPrice: finalProductPriceOfOrder.toFixed(2), initialPayment: initialPaymentOfOrder.toFixed(2), balancePayment: updatedBalancePayment.toFixed(2), emiAmount: roundOfEmi,emiBalancePayment:roundOfEmi,emiPaidAmount:0, paymentDescription: updatedPaymentTag, orderStatusId: 1, dueDate: date });
//                     }else {
//                         await OrderEmiDetail.create({ orderId, finalOrderPrice: finalProductPriceOfOrder.toFixed(2), initialPayment: initialPaymentOfOrder.toFixed(2), balancePayment: updatedBalancePayment.toFixed(2), emiAmount: finalMonthEmiAmount.toFixed(2),emiBalancePayment:finalMonthEmiAmount.toFixed(2),emiPaidAmount:0, paymentDescription: updatedPaymentTag, orderStatusId: 1, dueDate: date });
//                     }
                   
//                 }
//                 // await orderDetailmodel.updateEmiAmount(orderId, roundOfEmi);

//             } else if (paymentTypeId == 2) {
//                 let Entry = 6;

//                 let date =await moment();
//                 // orderEmiDetails =  await OrderEmiDetail.create({ orderId, finalOrderPrice: finalProductPriceOfOrder.toFixed(2), initialPayment: initialPaymentOfOrder.toFixed(2), balancePayment: balancePaymentOfOrder.toFixed(2), paymentDescription: 'InitialPay', orderStatusId: 1,paymentRecievedDate:date });

//                 if(paymentMode == "paymentGateway"){
//                     orderEmiDetails =  await OrderEmiDetail.create({ orderId, finalOrderPrice: finalProductPriceOfOrder.toFixed(2), initialPayment: initialPaymentOfOrder.toFixed(2), balancePayment: balancePaymentOfOrder.toFixed(2), paymentDescription: 'InitialPay', orderStatusId: 4,paymentRecievedDate:date });
//                 }else{
//                     orderEmiDetails =  await OrderEmiDetail.create({ orderId, finalOrderPrice: finalProductPriceOfOrder.toFixed(2), initialPayment: initialPaymentOfOrder.toFixed(2), balancePayment: balancePaymentOfOrder.toFixed(2), paymentDescription: 'InitialPay', orderStatusId: 1,paymentRecievedDate:date });
//                 }
               
//                 for (let i = 0; i < Entry; i++) {
//                     date =await moment(date).add(1, 'M');
//                     let updatedBalancePayment = balancePaymentOfOrder - paymentAmountPerMonthOfOrder * (i + 1);
//                     let updatedPaymentTag = `${i + 1} EmiPay`;

//                     decimalsRoundOfThreeMonth = decimalsAfterRoundOff * 6;
//                     finalMonthEmiAmount = decimalsRoundOfThreeMonth + roundOfEmi;

//                     if(Entry > i + 1){
//                         console.log(updatedPaymentTag);
//                     await OrderEmiDetail.create({ orderId, finalOrderPrice: finalProductPriceOfOrder.toFixed(2), initialPayment: initialPaymentOfOrder.toFixed(2), balancePayment: updatedBalancePayment.toFixed(2), emiAmount: roundOfEmi,emiBalancePayment:roundOfEmi,emiPaidAmount:0, paymentDescription: updatedPaymentTag, orderStatusId: 1, dueDate: date });

//                     }else{
//                         console.log(updatedPaymentTag);

//                         await OrderEmiDetail.create({ orderId, finalOrderPrice: finalProductPriceOfOrder.toFixed(2), initialPayment: initialPaymentOfOrder.toFixed(2), balancePayment: updatedBalancePayment.toFixed(2), emiAmount: finalMonthEmiAmount.toFixed(2),emiBalancePayment:finalMonthEmiAmount.toFixed(2),emiPaidAmount:0, paymentDescription: updatedPaymentTag, orderStatusId: 1, dueDate: date });
//                     }
//                 }
//                 // await orderDetailmodel.updateEmiAmount(orderId, roundOfEmi);

//             } else if (paymentTypeId == 3) {
//                 let Entry = 9;

//                 let date =await moment();
//                 // orderEmiDetails = await OrderEmiDetail.create({ orderId, finalOrderPrice: finalProductPriceOfOrder.toFixed(2), initialPayment: initialPaymentOfOrder.toFixed(2), balancePayment: balancePaymentOfOrder.toFixed(2), paymentDescription: 'InitialPay', orderStatusId: 1,paymentRecievedDate:date });
               
//                 if(paymentMode == "paymentGateway"){
//                     orderEmiDetails =  await OrderEmiDetail.create({ orderId, finalOrderPrice: finalProductPriceOfOrder.toFixed(2), initialPayment: initialPaymentOfOrder.toFixed(2), balancePayment: balancePaymentOfOrder.toFixed(2), paymentDescription: 'InitialPay', orderStatusId: 4,paymentRecievedDate:date });
//                 }else{
//                     orderEmiDetails =  await OrderEmiDetail.create({ orderId, finalOrderPrice: finalProductPriceOfOrder.toFixed(2), initialPayment: initialPaymentOfOrder.toFixed(2), balancePayment: balancePaymentOfOrder.toFixed(2), paymentDescription: 'InitialPay', orderStatusId: 1,paymentRecievedDate:date });
//                 }

//                 for (let i = 0; i < Entry; i++) {
//                     date =await moment(date).add(1, 'M');
//                     let updatedBalancePayment = balancePaymentOfOrder - paymentAmountPerMonthOfOrder * (i + 1);
//                     let updatedPaymentTag = `${i + 1} EmiPay`;
//                     console.log(updatedPaymentTag);

//                     decimalsRoundOfThreeMonth = decimalsAfterRoundOff * 9;
//                     finalMonthEmiAmount = decimalsRoundOfThreeMonth + roundOfEmi;

//                     if(Entry > i + 1){
//                         await OrderEmiDetail.create({ orderId, finalOrderPrice: finalProductPriceOfOrder.toFixed(2), initialPayment: initialPaymentOfOrder.toFixed(2), balancePayment: updatedBalancePayment.toFixed(2), emiAmount: roundOfEmi,emiBalancePayment:roundOfEmi,emiPaidAmount:0, paymentDescription: updatedPaymentTag, orderStatusId: 1, dueDate: date });
//                     }else {
//                         await OrderEmiDetail.create({ orderId, finalOrderPrice: finalProductPriceOfOrder.toFixed(2), initialPayment: initialPaymentOfOrder.toFixed(2), balancePayment: updatedBalancePayment.toFixed(2), emiAmount: finalMonthEmiAmount.toFixed(2),emiBalancePayment:finalMonthEmiAmount.toFixed(2),emiPaidAmount:0, paymentDescription: updatedPaymentTag, orderStatusId: 1, dueDate: date });
//                     }
//                 }
//                 // await orderDetailmodel.updateEmiAmount(orderId, roundOfEmi );

//             } else if (paymentTypeId == 4) {
//                 let date =await moment();

//                 if(paymentMode == "paymentGateway"){
//                     orderEmiDetails = await OrderEmiDetail.create({ orderId, finalOrderPrice: finalProductPriceOfOrder.toFixed(2), paymentDescription: 'TotalPay', orderStatusId: 4,paymentRecievedDate:date });
//                 }else{
//                     orderEmiDetails = await OrderEmiDetail.create({ orderId, finalOrderPrice: finalProductPriceOfOrder.toFixed(2), paymentDescription: 'TotalPay', orderStatusId: 1,paymentRecievedDate:date });
//                 }

//                 // orderEmiDetails = await OrderEmiDetail.create({ orderId, finalOrderPrice: finalProductPriceOfOrder.toFixed(2), paymentDescription: 'TotalPay', orderStatusId: 1,paymentRecievedDate:date });
                   
//                 }
            
//                 return orderEmiDetails;

//     }



    return OrderEmiDetail;
}