module.exports = (sequelize, DataTypes) => {
    const WalletDetail = sequelize.define('walletDetails', {
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
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
        walletTempDetailId:{
            type: DataTypes.INTEGER,
            field: 'wallet_temp_detail_id',
        }
    }, {
        freezeTableName: true,
        tableName: 'wallet_details',
    })


    WalletDetail.associate = function (models) {
        WalletDetail.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
        WalletDetail.belongsTo(models.walletTempDetails, { foreignKey: 'walletTempDetailId', as: 'walletTempDetails' });
    }

    

    
    return WalletDetail;
}