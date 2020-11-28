module.exports = (sequelize, DataTypes) => {
    const DigiGoldOrderDetail = sequelize.define('digiGoldOrderDetail', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
        },
        orderId: {
            type: DataTypes.STRING,
            field: 'order_id',
        },
        metalType: {
            type: DataTypes.STRING,
            field: 'metal_type',
        },
        quantity: {
            type: DataTypes.STRING,
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
        // userAddressId: {
        //     type: DataTypes.STRING,
        //     field: 'user_address_id',
        // },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        },
    }, {
        freezeTableName: true,
        tableName: 'digital_gold_order_detail',
    });

    DigiGoldOrderDetail.associate = function(models) {
        DigiGoldOrderDetail.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
    }


    return DigiGoldOrderDetail;
}