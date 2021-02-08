module.exports = (sequelize, DataTypes) => {
    const WalletDetail = sequelize.define('walletDetails', {
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
        },
        orderTypeId: {
            type: DataTypes.INTEGER,
            field: 'order_type_id',
        },
        paymentOrderTypeId: {
            type: DataTypes.INTEGER,
            field: 'payment_order_type_id',
        },
        amount: {
            type: DataTypes.FLOAT,
            field: 'amount',
        },
        paymentDirection: {
            type: DataTypes.STRING,
            field: 'payment_direction',
        },
        description: {
            type: DataTypes.STRING,
            field: 'description',
        },
        productTypeId: {
            type: DataTypes.INTEGER,
            field: 'product_type_id'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        },
        transactionDate: {
            type: DataTypes.DATEONLY,
            field: 'transaction_date',
        },
        walletTempDetailId: {
            type: DataTypes.INTEGER,
            field: 'wallet_temp_detail_id',
        },
        transactionStatus: {
            type: DataTypes.ENUM,
            field: 'transaction_status',
            values: ['pending', 'completed', 'rejected'],
            defaultValue: 'pending'
        },
    }, {
        freezeTableName: true,
        tableName: 'wallet_details',
    })


    WalletDetail.associate = function (models) {
        WalletDetail.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
        WalletDetail.belongsTo(models.walletTempDetails, { foreignKey: 'walletTempDetailId', as: 'walletTempDetails' });
        WalletDetail.hasOne(models.walletTransactionDetails, { foreignKey: 'walletId', as: 'walletTransactionDetails' });
        WalletDetail.hasOne(models.digiGoldOrderDetail, { foreignKey: 'walletId', as: 'digiGoldOrderDetail' });
        WalletDetail.belongsTo(models.digiGoldOrderType, { foreignKey: 'orderTypeId', as: 'digiGoldOrderType' });
        WalletDetail.belongsTo(models.digiGoldOrderType, { foreignKey: 'paymentOrderTypeId', as: 'paymentOrderType' });


    }




    return WalletDetail;
}