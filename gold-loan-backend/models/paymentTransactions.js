const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
    const PaymentTransaction = sequelize.define('paymentTransaction', {
        orderEmiId: {
            type: DataTypes.INTEGER,
            field: 'order_emi_id'
        },
        ordertransactionId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'order_transcation_id'
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'emi_payment_transaction',
    });

    PaymentTransaction.associate = function (models) {
        PaymentTransaction.belongsTo(models.orderEmiDetails, { foreignKey: 'orderEmiId', as: 'orderPaymentDetails' });
        PaymentTransaction.belongsTo(models.orderTransaction, { foreignKey: 'ordertransactionId', as: 'orderTransactionDetails' });
    }

    return PaymentTransaction;
}