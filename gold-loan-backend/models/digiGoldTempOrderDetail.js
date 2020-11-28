module.exports = (sequelize, DataTypes) => {

    const DigiGoldTempOrderDetail = sequelize.define('digiGoldTempOrderDetail', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },
        orderTypeId: {
            type: DataTypes.INTEGER,
            field: 'order_type_id',
            allowNull: false
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
        // goldBalance: {
        //     type: DataTypes.FLOAT,
        //     field: 'gold_balance',
        //     defaultValue: true,
        // },
        // silverBalance: {
        //     type: DataTypes.FLOAT,
        //     field: 'silver_balance',
        //     defaultValue: true,
        // },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
        },
        isOrderPlaced: {
            type: DataTypes.BOOLEAN,
            field: 'is_order_placed',
            defaultValue: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        },

    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'digi_gold_temp_order_detail',
    });

    // DigiGoldConfigDetails.associate = function(models) {
    // GlobalSetting.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });

    // }


    return DigiGoldTempOrderDetail;
}