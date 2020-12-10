module.exports = (sequelize, DataTypes) => {
    const WalletTempDetails = sequelize.define('walletTempDetails', {
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
        iaActive: {
            type: DataTypes.BOOLEAN,
            field: 'ia_active',
            defaultValue: true,
        },
        transactionDate: {
            type: DataTypes.DATEONLY,
            field: 'transaction_date',
        }
    }, {
        freezeTableName: true,
        tableName: 'wallet_temp_details',
    })

    WalletTempDetails.getTempWalletData = (id) => WalletTempDetails.findOne({where:{id }});


    return WalletTempDetails;
}