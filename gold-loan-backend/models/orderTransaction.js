const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
    const OrderTransaction = sequelize.define('orderTransaction', {
        orderId: {
            type: DataTypes.INTEGER,
            field: 'order_id'
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'transcation_id'
        },
        transactionAmount: {
            type: DataTypes.FLOAT,
            field: 'transcation_amount'
        },
        paymentRecievedDate: {
            type: DataTypes.DATE,
            field: 'payment_recieved_date',
            allowNull: true,
        },
        razorpayOrderId:{
            type: DataTypes.STRING,
            field: 'razorpay_order_id'
        },
        razorpayPaymentId:{
            type: DataTypes.STRING,
            field: 'razorpay_payment_id'
        },
        razorpaySignature:{
            type: DataTypes.STRING,
            field: 'razorpay_signature'
        },
        paymentStatusId:{
            type: DataTypes.INTEGER,
            field: 'payment_status_id'
        },
        transactionUniqueId: {
            type: DataTypes.STRING,
            field: 'transaction_unique_id'
        },
        paymentMode: {
            type: DataTypes.ENUM,
            field: 'payment_modes',
            values: ['paymentGateway','imps','neft','rtgs','upi','cheque','cash', 'partnerWallet']
        },
        bankName: {
            type: DataTypes.STRING,
            field: 'bank_name'
        },
        bankBranch: {
            type: DataTypes.STRING,
            field: 'bank_branch'
        },
        chequeNumber: {
            type: DataTypes.STRING,
            field: 'cheque_number'
        },
        paymentFor: {
            type: DataTypes.STRING,
            field: 'payment_for'
        },
        emiId:{
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            field: 'emi_id'
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'emi_order_transaction',
    });

    OrderTransaction.associate = function (models) {
        OrderTransaction.belongsTo(models.orders, { foreignKey: 'orderId', as: 'order' });
        // OrderTransaction.belongsTo(models.orderStatus, { foreignKey: 'paymentStatusId', as: 'paymentStatus' });

    }

    return OrderTransaction;
}