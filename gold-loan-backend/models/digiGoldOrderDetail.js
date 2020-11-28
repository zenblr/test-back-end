module.exports = (sequelize, DataTypes) => {
    const DigiGoldOrderDetail = sequelize.define('digiGoldOrderDetail', {
        // attributes
        temporderid: {
            type: DataTypes.INTEGER,
            field: 'temp_order_id',
            allowNull: false
        },
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
        },
        orderTypeId: {
            type: DataTypes.INTEGER,
            field: 'order_type_id',
            allowNull: false
        },
        orderId: {
            type: DataTypes.STRING,
            field: 'order_id',
        },
        totalAmount: {
            type: DataTypes.FLOAT,
            field: 'total_amount',
            defaultValue: true,
        },
        coupanCode: {
            type: DataTypes.STRING,
            field: 'coupan_code',
            defaultValue: true,
        },
        walletBalance: {
            type: DataTypes.FLOAT,
            field: 'wallet_balance',
            defaultValue: true,
        },
        metalType: {
            type: DataTypes.STRING,
            field: 'metal_type',
        },
        quantity: {
            type: DataTypes.FLOAT,
            field: 'quantity',
        },
        lockPrice: {
            type: DataTypes.FLOAT,
            field: 'lock_price',
        },
        blockId: {
            type: DataTypes.STRING,
            field: 'block_id',
        },
        rate: {
            type: DataTypes.FLOAT,
            field: 'rate',
        },
        amount: {
            type: DataTypes.FLOAT,
            field: 'amount',
        },
        quantityBased: {
            type: DataTypes.BOOLEAN,
            field: 'quantity_based',
        },
        modeOfPayment: {
            type: DataTypes.STRING,
            field: 'mode_of_payment',
        },
        userAddressId: {
            type: DataTypes.STRING,
            field: 'user_address_id',
        },
        goldBalance: {
            type: DataTypes.FLOAT,
            field: 'gold_balance',
            defaultValue: true,
        },
        silverBalance: {
            type: DataTypes.FLOAT,
            field: 'silver_balance',
            defaultValue: true,
        },
        merchantTransactionId: {
            type: DataTypes.STRING,
            field: 'merchant_transaction_id'
        },
        transactionId: {
            type: DataTypes.STRING,
            field: 'transaction_id'
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
        orderSatatus: {
            type: DataTypes.STRING,
            field: 'order_satatus',
            defaultValue: "pending",
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        },
    }, {
        freezeTableName: true,
        tableName: 'digital_gold_order_detail',
    });

    DigiGoldOrderDetail.associate = function (models) {
        DigiGoldOrderDetail.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
    }


    return DigiGoldOrderDetail;
}