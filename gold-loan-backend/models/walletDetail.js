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
        }
    }, {
        freezeTableName: true,
        tableName: 'wallet_details',
    })



    

    
    return WalletDetail;
}